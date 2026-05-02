"use client";

import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const res = await api.post("/auth/login/", data);

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      <form className="bg-gray-900 p-8 rounded-xl w-96 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input {...register("email")} placeholder="Email"
          className="w-full p-2 rounded bg-gray-800" />

        <input {...register("password")} type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-800" />

        <button className="w-full bg-blue-600 p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}