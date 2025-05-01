import Logo from "@/app/_components/Logo";
import Navigation from "@/app/_components/Navigation";
import "@/app/_styles/globals.css";
import Header from "@/app/_components/Header";

export const metadata = {
  title: {
    template: " %s / The Wood Hotel",
    default: "Welcome / The Wood Hotel",
  },
  description:
    "Luxurious cabins hotel,loacted in India/Kashmir,surrounded with beautiful mountains and dark forests.",
};
import { Josefin_Sans } from "next/font/google";
import { ReservationProvider } from "./_components/ReservationContext";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});
// console.log(josefin);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} bg-primary-950 antialiased text-primary-100 min-h-screen flex flex-col`}
      >
        <Header>
          <Logo />
          <Navigation />
        </Header>
        <div className="flex-1 px-8 py-12 grid">
          <main className="w-full">
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
