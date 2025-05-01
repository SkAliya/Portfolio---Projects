"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import supabase from "./supabase";
import { getBookings, getGuest } from "./data-service";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}
export async function signOutAction() {
  await signOut("google", { redirectTo: "/" });
}

export async function updateGuest(formData) {
  console.log(formData);
  const session = await auth();

  if (!session) throw new Error("Please loggedIn before doing anything!");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updatedData = {
    nationalID,
    nationality,
    countryFlag,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updatedData)
    .eq("id", session.user.guestId);

  revalidatePath("/account/profile");

  if (error) throw new Error("Guest could not be updated");
}

export async function deleteReservation(bookingId) {
  // throw new Error();

  const session = await auth();
  if (!session) throw new Error("Please loggedIn before doing anything!");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsArray = guestBookings.map((booking) => booking.id);

  if (!guestBookingsArray.includes(bookingId))
    throw new Error("You are not allowed to delete this reservation");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function editReservation(formData) {
  const session = await auth();
  if (!session) throw new Error("Please loggedIn before doing anything!");

  const numGuests = Number(formData.get("numGuests"));
  const observations = formData.get("observations").slice(0, 1000);
  const bookingId = Number(formData.get("bookingId"));

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsArray = guestBookings.map((booking) => booking.id);

  if (!guestBookingsArray.includes(bookingId))
    throw new Error("You are not allowed to update this reservation");

  // console.log(formData);

  const updatedData = {
    numGuests,
    observations,
  };

  const { data, error } = await supabase
    .from("bookings")
    .update(updatedData)
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be updated");

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}

export async function createBooking(updatedData, formData) {
  const session = await auth();
  if (!session) throw new Error("Please loggedIn before doing anything!");

  const observations = formData.get("observations").slice(0, 1000);
  const numGuests = Number(formData.get("numGuests"));

  const newData = {
    ...updatedData,
    numGuests,
    observations,
    totalPrice: updatedData.cabinPrice,
    status: "unconfirmed",
    isPaid: false,
    guestId: session.user.guestId,
    extrasPrice: 0,
    hasBreakfast: false,
  };
  console.log(newData);

  const { error } = await supabase.from("bookings").insert([newData]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${updatedData.cabinId}`);
  redirect("/cabins/thankyou");
}
