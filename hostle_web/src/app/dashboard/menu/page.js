import { Button } from "@/Components/form";
import React from "react";

const products = () => {
  return (
    <div>
      <section className="dashboard_title">
        <h3>Menu</h3>
      </section>

      <div className="wrapper_search move_right">
        <Button type="button">Add</Button>
      </div>
    </div>
  );
};

export default products;
