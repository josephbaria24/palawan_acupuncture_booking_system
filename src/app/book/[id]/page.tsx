import PublicBookingScreen from "@/screens/public/booking";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicBookingScreen id={id} />;
}
