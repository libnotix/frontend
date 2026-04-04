"use client";

import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, FileText, Loader2, BookOpen } from "lucide-react";
import { CreateDraftRequestFormatEnum } from "@/api";

interface Draft {
  id: string;
  title: string;
  format: string;
  updatedAt: string;
  createdAt: string;
}

const VazlatokPage = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await api.draftsGetRaw();
      const data = await res.raw.json();
      const draftsArray = data?.drafts || data;
      if (Array.isArray(draftsArray)) {
        setDrafts(draftsArray);
      }
    } catch (error) {
      console.error("Failed to fetch drafts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleCreateDraft = async () => {
    try {
      setCreating(true);
      const res = await api.draftsPostRaw({
        createDraftRequest: {
          title: "Új Vázlat", // "New Draft"
          format: CreateDraftRequestFormatEnum.SimaVazlat,
          content: [
            {
              type: "heading-one",
              children: [{ text: "Új Vázlat" }],
            },
            {
              type: "paragraph",
              children: [{ text: "Kezdj el gépelni ide..." }],
            },
          ] as unknown as object,
        },
      });
      const resJson = await res.raw.json();
      const newDraft = resJson?.draft || resJson;
      if (newDraft && newDraft.id) {
        router.push(`/dashboard/vazlatok/${newDraft.id}`);
      }
    } catch (error) {
      console.error("Failed to create draft", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Biztosan törölni szeretnéd ezt a vázlatot?")) return;
    try {
      await api.draftsIdDeleteRaw({ id: Number(id) });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete draft", error);
    }
  };

  const formatTypeToLabel = (format: string) => {
    switch (format) {
      case "sima_vazlat":
        return "Sima Vázlat";
      case "oravazlat":
        return "Óravázlat";
      case "eves_tanterv":
        return "Éves Tanterv";
      default:
        return "Egyéb";
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-primary" />
            Vázlatok
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Kezeld és szerkeszd a piszkozataidat, vagy hozz létre újat a
            szuper-erős AI szerkesztővel.
          </p>
        </div>
        <button
          onClick={handleCreateDraft}
          disabled={creating}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Új Vázlat
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-12 h-12 text-primary/40 animate-spin" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-border rounded-2xl bg-card">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Nincsenek vázlatok</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Még nem hoztál létre egyetlen vázlatot sem. Kattints az "Új Vázlat"
            gombra, hogy elkezdj dolgozni a beépített AI asszisztenssel!
          </p>
          <button
            onClick={handleCreateDraft}
            className="bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-lg transition-transform active:scale-95 shadow-sm"
          >
            Első Vázlat Létrehozása
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              onClick={() => router.push(`/dashboard/vazlatok/${draft.id}`)}
              className="group flex flex-col bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 cursor-pointer transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />

              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {formatTypeToLabel(draft.format)}
                </span>
                <button
                  onClick={(e) => handleDelete(e, draft.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {draft.title || "Névtelen vázlat"}
              </h3>

              <div className="mt-auto pt-4 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50">
                <span>
                  Utolsó módosítás:{" "}
                  {new Date(draft.updatedAt).toLocaleDateString("hu-HU")}
                </span>
                <Edit2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(VazlatokPage);
