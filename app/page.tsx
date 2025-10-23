"use client";

import React from "react";
import dynamic from "next/dynamic";

const CytoGraph = dynamic(() => import("./components/CytoGraph"), { ssr: false });

export default function HomePage() {
  return (
    <div className="w-screen h-screen bg-gray-950 text-white">
      <h1 className="text-center text-3xl font-bold py-4">PeopleInt Maltego Graph</h1>
      <CytoGraph />
    </div>
  );
}
