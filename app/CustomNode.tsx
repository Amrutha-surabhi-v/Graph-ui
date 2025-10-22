import React from "react";
import { Handle, Position } from "reactflow";
import { Globe, User, AlertTriangle, AtSign } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  person: <User className="w-6 h-6 text-sky-400" />,
  email: <AtSign className="w-6 h-6 text-orange-400" />,
  domain: <Globe className="w-6 h-6 text-green-400" />,
  social: <AlertTriangle className="w-6 h-6 text-blue-400" />,
  profile: <User className="w-6 h-6 text-purple-400" />,
};

export default function CustomNode({
  data,
}: {
  data: { label: string; type: string };
}) {
  const icon = iconMap[data.type] || <User className="w-6 h-6 text-gray-400" />;

  return (
    <div className="bg-gray-800 border border-gray-600 text-white p-3 rounded-xl w-40 text-center shadow-lg">
      <div className="flex flex-col items-center">
        <div className="p-2 bg-gray-900 rounded-full mb-2">{icon}</div>
        <span className="text-sm font-semibold">{data.label}</span>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
