import { TextArea } from "@/Components/form";
import RHFCloudinaryUpload from "@/Components/RHFHelperComponent/RHFImages/RHFCloudinaryUpload";
import RHFInput from "@/Components/RHFHelperComponent/RHFInput/RHFInput";
import { logger } from "@/utils/logger";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const MealSection = ({ mealType, control, register, errors }) => {
  // "use no memo";
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${mealType}.foods`,
  });

  // logger.log("MealSection Rendered:----->", fields);
  console.log("MealSection Rendered:----->", fields);

  return (
    <div className="meal_section">
      <div className="meal_header">
        <h4>{mealType}</h4>
      </div>
      <div className="meal_body">
        <div className="form_row">
          <div className="field_group">
            <TextArea
              label="Description (Optional)"
              placeholder={`Describe the ${mealType} meal...`}
              {...register(`${mealType}.description`)}
              error={errors?.[mealType]?.description?.message}
            />
          </div>
        </div>

        {fields.length > 0 && (
          <div className="foods_list">
            {fields.map((field, index) => (
              <div key={field.id} className="food_item">
                <button
                  type="button"
                  className="btn_remove_food"
                  onClick={() => remove(index)}
                  title="Remove Food"
                >
                  <FiTrash2 />
                </button>
                <div className="form_row">
                  <div className="field_group">
                    <RHFInput
                      name={`${mealType}.foods.${index}.name`}
                      control={control}
                      label={`Food Name ${index + 1}`}
                      placeholder="e.g. Daal Makhani"
                      required
                    />
                  </div>
                </div>
                <div className="form_row">
                  <div className="field_group">
                    <label className="label">
                      Food Images <span className="text-danger">*</span>
                    </label>
                    <RHFCloudinaryUpload
                      name={`${mealType}.foods.${index}.images`}
                      control={control}
                      multiple={true}
                      maxFiles={3}
                    />
                    {errors?.[mealType]?.foods?.[index]?.images?.message && (
                      <span className="error_text">
                        {errors?.[mealType]?.foods?.[index]?.images?.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="btn_add_food"
          onClick={() => append({ name: "", images: [] })}
        >
          <FiPlus /> Add {mealType} Food
        </button>
      </div>
    </div>
  );
};

export default MealSection;
