"use client";

import { memo } from "react";
import SlateEditor from "./SlateEditor";

const VazlatokPage = () => (
  <div className="container mx-auto mt-10">
    <h1 className="text-4xl font-bold">Vázlatok</h1>
    <SlateEditor />
  </div>
);

export default memo(VazlatokPage);
