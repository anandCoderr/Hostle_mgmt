"use client";
import { Button } from "@/Components/form";
import { useRouter } from "next/navigation";
import React from "react";

const AddButton = () => {
  const router = useRouter();

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          router.push("/dashboard/menu/add");
        }}
      >
        Add
      </Button>
    </>
  );
};

export default AddButton;
