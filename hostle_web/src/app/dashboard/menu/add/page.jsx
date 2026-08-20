"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMenuRule } from "@/utils/SchemaValidations/commonSchema/_commonSchema";
import { TextArea, CommonSelect } from "@/Components/form";
import RHFInput from "@/Components/RHFHelperComponent/RHFInput/RHFInput";
import RhfDatePicker from "@/Components/RHFHelperComponent/RHFDatePicker/RhfDatePicker";
import RHFCloudinaryUpload from "@/Components/RHFHelperComponent/RHFImages/RHFCloudinaryUpload";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import "./AddMenu.scss";
import { toastMessage } from "@/utils/toastMessage";
import MealSection from "../Component/MealSection";
import { bootstrapLoaderHelperFun } from "@/Components/bootstrapLoader";

const weekDays = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

const AddMenuPage = () => {
  const [activeTab, setActiveTab] = useState("WEEKLY");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(addMenuRule),
    defaultValues: {
      type: "WEEKLY",
      title: "",
      description: "",
      day: undefined,
      breakfast: { description: "", foods: [] },
      lunch: { description: "", foods: [] },
      dinner: { description: "", foods: [] },
    },
  });

  // -----------------------------to disable and enable button
  const isSubmitEnabled = isDirty && isValid;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setValue("type", tab, { shouldValidate: true });

    // Clear the specific fields when switching tabs
    if (tab === "WEEKLY") {
      setValue("date", undefined);
    } else {
      setValue("day", undefined);
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted Successfully:", data);
    toastMessage("Menu data generated in console", "success");
  };

  return (
    <div className="add_menu_page">
      <div className="page_header">
        <h3>Add Menu</h3>
      </div>

      <div className="form_card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="tabs_wrapper">
            <button
              type="button"
              className={`tab_btn ${activeTab === "WEEKLY" ? "active" : ""}`}
              onClick={() => handleTabChange("WEEKLY")}
            >
              WEEKLY
            </button>
            <button
              type="button"
              className={`tab_btn ${activeTab === "SPECIAL" ? "active" : ""}`}
              onClick={() => handleTabChange("SPECIAL")}
            >
              SPECIAL
            </button>
          </div>

          <div className="form_row">
            {activeTab === "WEEKLY" ? (
              <div className="field_group">
                <Controller
                  name="day"
                  control={control}
                  render={({ field }) => (
                    <CommonSelect
                      label="Day"
                      options={weekDays}
                      value={
                        weekDays.find((d) => d.value === field.value) || null
                      }
                      onChange={(selected) => field.onChange(selected?.value)}
                      error={errors?.day?.message}
                      placeholder="Select Day"
                      required
                    />
                  )}
                />
              </div>
            ) : (
              <div className="field_group">
                <RhfDatePicker
                  name="date"
                  control={control}
                  label="Date"
                  placeholder="Select Date"
                  required
                />
              </div>
            )}

            <div className="field_group">
              <RHFInput
                name="title"
                control={control}
                label="Menu Title"
                placeholder="e.g. Sunday Special"
                required
              />
            </div>
          </div>

          <div className="form_row">
            <div className="field_group">
              <TextArea
                label="Main Description (Optional)"
                placeholder="Brief description about the menu..."
                {...register("description")}
                error={errors?.description?.message}
              />
            </div>
          </div>

          {/* Meals Sections */}
          <MealSection
            mealType="breakfast"
            control={control}
            register={register}
            errors={errors}
          />
          <MealSection
            mealType="lunch"
            control={control}
            register={register}
            errors={errors}
          />
          <MealSection
            mealType="dinner"
            control={control}
            register={register}
            errors={errors}
          />

          <div className="form_actions">
            <button
              type="submit"
              className="btn_submit"
              disabled={!isSubmitEnabled || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Menu"}
              {isSubmitting && bootstrapLoaderHelperFun()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuPage;
