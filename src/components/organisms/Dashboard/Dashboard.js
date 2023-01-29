const Dashboard = ({ children }) => <dl className="grid grid-cols-1 gap-3 mt-5 md:grid-cols-3">{children}</dl>;

const Item = ({ title = "", value = 0, currency = "", extraValue = null }) => {
  return (
    <div className="p-3 overflow-hidden bg-[#131519]/30 rounded-xl">
      <dt className="mb-2 text-[12.8px] font-medium leading-none text-gray-500 truncate">{title}</dt>
      <dd className="mt-1 text-xl tracking-tight text-white">
        <b>{typeof value === "number" ? +Number(+value.toFixed(9)).toPrecision(9) : value}</b> <small>{currency}</small>{" "}
      </dd>
      <dd className="leading-none tracking-tight text-white/75">{extraValue}</dd>
    </div>
  );
};

Dashboard.Item = Item;

export default Dashboard;
