import SideNavigation from "../_components/SideNavigation";

// export const metadata = {
//   title: {
//     template: "%s / The Wood Hotel",
//   },
// }; no need this

export default function Layout({ children }) {
  return (
    <div className="grid grid-cols-[16rem_1fr] gap-12 h-full">
      <SideNavigation />
      <div className="py-1">{children}</div>
    </div>
  );
}
