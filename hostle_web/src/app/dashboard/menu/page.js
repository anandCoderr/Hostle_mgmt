import React from "react";
import AddButton from "./Component/AddButton";

const products = () => {
  return (
    <div>
      <section className="dashboard_title">
        <h3>Menu</h3>
      </section>

      <div className="wrapper_search move_right">
        <AddButton />
      </div>
    </div>
  );
};

export default products;
