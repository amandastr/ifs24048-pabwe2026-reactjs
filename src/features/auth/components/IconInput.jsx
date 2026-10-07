export default function IconInput({ label, icon: Icon, ...props }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
        {label}
      </span>
      <span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <Icon size={18} className="text-slate-600" />
        <input
          {...props}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}
