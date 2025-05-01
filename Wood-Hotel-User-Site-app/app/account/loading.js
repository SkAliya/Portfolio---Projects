import Spinner from "@/app/_components/Spinner";

export default function Loading() {
  return (
    <div className="grid items-center justify-center gap-2">
      <Spinner />
      <p className="text-primary-200 text-xl">Loading...</p>
    </div>
  );
}
