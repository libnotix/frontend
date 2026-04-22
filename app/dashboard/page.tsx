"use client"
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerApi } from "@/lib/api";
import type { SchoolClass } from "@/api";

const DashboardPage = () => {
    const router = useRouter();
    const user = useContext(AuthContext);
    const [classes, setClasses] = useState<SchoolClass[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const api = await getServerApi();
                const res = await api.classesGet();
                setClasses(res.classes || []);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    const topTwo = useMemo(() => classes.slice(0, 2), [classes]);

    return (
        <div className="container mx-auto p-5 pt-10 space-y-8">
            <div className="flex justify-between flex-row gap-4 items-start">
                <h1 className="text-4xl font-bold">Üdv, {user?.firstName}!</h1>
                <div className="space-y-3 pb">
                    <Link href="" className="w-100 h-100 bold border-1px-solid mb-8 text-2xl font-bold transition-opacity">
                        Osztályaim
                    </Link>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {topTwo.map((cls) => (
                             <Card
                             key={cls.id}
                             className="group relative border border-[#262626] bg-gradient-to-b from-[#111111] to-[#0a0a0a] shadow-lg rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300"
                           >
                            
                             <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                             <CardContent className="p-6 flex flex-col justify-between h-full space-y-6 relative z-10">
                               <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                   <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">{cls.name}</h3>
                                   <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Osztály {cls.classNumber ? `(${cls.classNumber}. évf.)` : ''}</p>
                                 </div>
                               </div>
                               <Button
                                 variant="secondary"
                                 className="w-full bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 border border-white/10 transition-all duration-300 rounded-xl"
                                 onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                               >
                                 Megnyitás
                               </Button>
                             </CardContent>
                           </Card>
                        ))}

                       <Link href="dashboard/classes/classlist" className="text-orange-400 hover:text-orange-600 opacity-85 transition-colors">Ugrás az osztályokhoz</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(DashboardPage); 