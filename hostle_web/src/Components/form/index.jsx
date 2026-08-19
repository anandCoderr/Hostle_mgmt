"use client";
import { FaRegStar, FaStar, FaStarHalf } from "react-icons/fa";
import { forwardRef, useEffect, useState, useId } from "react";
import { LuCalendarDays } from "react-icons/lu";
import ReactDatePicker from "react-datepicker";
import MultiSelect from "react-select";
import { components } from "react-select";
import { Form } from "react-bootstrap";
import { CiSearch } from "react-icons/ci";
import "./form.scss";
import Image from "next/image";
import { calendaricon } from "@/assets/icons";

export const RatingStar = ({
  user,
  totalcount,
  rating = 0,
  readonly = true,
  onChange,
  ...rest
}) => {
  const [ratingValue, setRatingValue] = useState(parseFloat(rating) || 0);

  useEffect(() => {
    setRatingValue(parseFloat(rating) || 0);
  }, [rating]);

  const handleRatingChange = (newRating) => {
    if (readonly) return;
    setRatingValue(newRating);
    if (onChange) onChange(newRating);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fill = Math.min(Math.max(ratingValue - (i - 1), 0), 1);
      stars.push(
        <span
          key={i}
          onClick={() => handleRatingChange(i)}
          style={{
            position: "relative",
            display: "inline-block",
            cursor: readonly ? "default" : "pointer",
            marginRight: "2px",
          }}
        >
          <FaStar className="cstm_color" style={{ marginRight: 0 }} />
          {fill > 0 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${fill * 100}%`,
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              <FaStar style={{ marginRight: 0 }} />
            </span>
          )}
        </span>,
      );
    }
    return stars;
  };

  return (
    <div className="rating">
      <div className="rating_star" {...rest}>
        {renderStars()}
      </div>
      <p className="wrap_rating_p">
        <span className="user">{user}</span>
        <span className="total_count">({totalcount})</span>
      </p>
    </div>
  );
};

export const Button = ({ type, className, isDisabled, children, ...rest }) => {
  return (
    <>
      <button
        type={type ? type : "button"}
        disabled={isDisabled}
        className={`button ${className}`}
        {...rest}
      >
        {children}
      </button>
    </>
  );
};

export const LoadingButton = ({
  isDisabled = false,
  children,
  loading,
  className = "",
  ...rest
}) => {
  return (
    <button
      className={`button has_loader ${className}`}
      {...rest}
      disabled={isDisabled}
    >
      {loading ? (
        <>
          {/* <span
            className="spinner-grow spinner-grow-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Loading... */}
          <svg
            version="1.1"
            id="L4"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 60 100"
            enableBackground="new 0 0 0 0"
            xmlSpace="preserve"
          >
            <circle fill="#fff" stroke="none" cx="6" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.1"
              ></animate>
            </circle>
            <circle fill="#fff" stroke="none" cx="26" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.2"
              ></animate>
            </circle>
            <circle fill="#fff" stroke="none" cx="46" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.3"
              ></animate>
            </circle>
          </svg>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const LoadingButtonCart = ({
  isDisabled = false,
  children,
  loading,
  className = "",
  ...rest
}) => {
  return (
    <button
      className={`button has_loader ${className}`}
      {...rest}
      disabled={isDisabled}
    >
      {loading ? (
        <>
          {/* <span
            className="spinner-grow spinner-grow-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Loading... */}
          <svg
            version="1.1"
            id="L4"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 60 100"
            enableBackground="new 0 0 0 0"
            xmlSpace="preserve"
          >
            <circle fill="#11234f" stroke="none" cx="6" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.1"
              ></animate>
            </circle>
            <circle fill="#11234f" stroke="none" cx="26" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.2"
              ></animate>
            </circle>
            <circle fill="#11234f" stroke="none" cx="46" cy="50" r="6">
              <animate
                attributeName="opacity"
                dur="1s"
                values="0;1;0"
                repeatCount="indefinite"
                begin="0.3"
              ></animate>
            </circle>
          </svg>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const Input = forwardRef(
  (
    {
      value = "",
      onChange,
      className = "",
      label,
      error,
      required,
      extraError = false,
      infoErr = false,
      optional = false,
      subText,
      maxLength = "100000000",
      ...rest
    },
    ref,
  ) => {
    const classGenerator = () => {
      if (infoErr && extraError) {
        return "is-invalid";
      }
      if (infoErr) {
        return "info";
      }
      return ((!value && error) || extraError) && "is-invalid";
    };
    return (
      <>
        {label && (
          <label className="label">
            {label}
            {required && <span className="required mx-1"> *</span>}
            {optional && <em className="optional">{"(optional)"}</em>}
            {subText && <span className="subText">{subText}</span>}
          </label>
        )}
        <input
          value={value}
          maxLength={100000000}
          onChange={onChange}
          className={`form-control input ${className} ${classGenerator()}`}
          ref={ref}
          {...rest}
        />
        {error && (
          <span className={`${infoErr ? "info-feedback" : "invalid-feedback"}`}>
            {error}
          </span>
        )}
      </>
    );
  },
);

export const Select = forwardRef(
  (
    {
      label,
      onChange,
      value,
      error,
      className = "",
      children,
      required,
      optional,
      ...rest
    },
    ref,
  ) => {
    return (
      <>
        {label && (
          <label className="label">
            {label}
            {required && <span className="required mx-1"> *</span>}
            {optional && <em className="optional">{"(optional)"}</em>}
          </label>
        )}
        <select
          onChange={onChange}
          value={value}
          className={`form-control input ${className} ${
            !value && error && "is-invalid"
          }`}
          ref={ref}
          {...rest}
        >
          {children}
        </select>
        {error && <span className="invalid-feedback">{error}</span>}
      </>
    );
  },
);

export const TextArea = forwardRef(
  ({ value, onChange, label, className = "", error, ...rest }, ref) => {
    return (
      <>
        {label && <label className="my-1 label">{label}</label>}
        <textarea
          value={value}
          onChange={onChange}
          className={`form-control input ${className} ${
            !value && error && "is-invalid"
          }`}
          maxLength={10000000000}
          ref={ref}
          {...rest}
        />
        {error && <span className="invalid-feedback">{error}</span>}
      </>
    );
  },
);

export const DatePicker = forwardRef(
  (
    {
      value,
      onChange,
      className = "",
      label,
      error,
      required,
      extraError = false,
      infoErr = false,
      optional = false,
      placeholder,
      ...rest
    },
    ref,
  ) => {
    const classGenerator = () => {
      if (infoErr && extraError) {
        return "is-invalid";
      }
      if (infoErr) {
        return "info";
      }
      return ((!value && error) || extraError) && "is-invalid";
    };

    return (
      <>
        {label && (
          <label className="label">
            {label}
            {required && <span className="required mx-1"> *</span>}
            {optional && <em className="optional">{"(optional)"}</em>}
          </label>
        )}
        <ReactDatePicker
          ref={ref}
          className={`form-control input date_picker ${className} ${classGenerator()}`}
          showIcon
          // icon={<LuCalendarDays />}
          icon={
            <Image
              src={calendaricon}
              alt="calendar"
              width={18}
              height={18}
              style={{ cursor: "pointer" }}
            />
          }
          selected={value}
          onChange={onChange}
          dateFormat={"dd-MMM-yyyy"}
          showMonthDropdown
          useShortMonthInDropdown
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={300}
          onChangeRaw={(e) => e.preventDefault()}
          {...rest}
          placeholderText={placeholder}
        />
        {!value && error && (
          <span
            className={`${
              infoErr ? "info-feedback" : "invalid-feedback"
            } d-block`}
          >
            {error}
          </span>
        )}
      </>
    );
  },
);

export const YearPicker = forwardRef(
  (
    {
      value,
      onChange,
      className = "",
      label,
      error,
      required,
      extraError = false,
      infoErr = false,
      optional = false,
      ...rest
    },
    ref,
  ) => {
    const classGenerator = () => {
      if (infoErr && extraError) {
        return "is-invalid";
      }
      if (infoErr) {
        return "info";
      }
      return ((!value && error) || extraError) && "is-invalid";
    };

    return (
      <>
        {label && (
          <label className="label">
            {label}
            {required && <span className="required mx-1"> *</span>}
            {optional && <em className="optional">{"(optional)"}</em>}
          </label>
        )}
        <ReactDatePicker
          ref={ref}
          className={`form-control input date_picker ${className} ${classGenerator()}`}
          showIcon
          icon={<LuCalendarDays />}
          selected={value}
          onChange={onChange}
          dateFormat="MMM yyyy"
          // useShortMonthInDropdown
          // showYearDropdown
          // scrollableYearDropdown
          showMonthYearDropdown
          onChangeRaw={(e) => e.preventDefault()}
          {...rest}
          yearDropdownItemNumber={300}
        />
        {!value && error && (
          <span
            className={`${
              infoErr ? "info-feedback" : "invalid-feedback"
            } d-block`}
          >
            {error}
          </span>
        )}
      </>
    );
  },
);

export const CommonSelect = ({
  label,
  onChange,
  value,
  error,
  className = "",
  options = [],
  isMulti = false,
  isSearchable = false,
  noOptionsMessage = () => "No options found",
  required = false,
  loading = false,
  isDisabled = false,
  placeholder = "Select",

  ...rest
}) => {
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected
        ? "linear-gradient(180deg, #f17f1f 0%, #f17f1f 100%)"
        : "#fff", // Change background color of selected option
      color: state.isSelected
        ? "linear-gradient(180deg, #f17f1f 0%, #f17f1f 100%)"
        : "black", // Change text color of selected option
      "&:hover": {
        background: "linear-gradient(180deg, #f17f1f 0%, #f17f1f 100%)", // Change background color of option on hover
        color: "#fff", // Change text color of option on hover
      },
    }),
    loadingIndicator: (base, state) => ({
      ...base,
      color: "#FF8989", // Set the color to red
    }),
  };

  const LoadingIndicator = (props) => {
    return (
      <components.LoadingIndicator {...props}>
        {/* <ClipLoader size={20} color="#999" loading={true} />
         */}
        <p>Loading...</p>
      </components.LoadingIndicator>
    );
  };

  const selectId = useId();

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions);
  };
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {required && <span className="text-danger"> *</span>}

      <MultiSelect
        instanceId={selectId}
        onChange={handleChange}
        value={value}
        className={`form-control multi-select ${className} ${
          !value && error && "is-invalid"
        }`}
        options={options}
        isMulti={isMulti}
        placeholder={placeholder}
        isSearchable={isSearchable}
        noOptionsMessage={noOptionsMessage}
        isLoading={loading}
        styles={customStyles}
        isDisabled={isDisabled}
        classNamePrefix="react_select"
        // placeholderText={placeholder}
        components={{ LoadingIndicator }}
        {...rest}
      />
      {/* {leftIcon} */}
      {error && <div className="invalid-feedback d-flex">{error}</div>}
    </div>
  );
};

// Switch Button //

export const SwitchButton = ({
  className = "",
  status = false,
  disabled,
  ...rest
}) => {
  return (
    <>
      <label className={`switch ${className} ${disabled ? "disabled" : ""}`}>
        <input
          type="checkbox"
          defaultChecked={status}
          disabled={disabled}
          {...rest}
        />
        <span className="slider round"></span>
      </label>
    </>
  );
};

// Search Component
export const Search = ({
  name,
  value,
  onChange,
  onClick = () => {},
  isIcon = false,
  children,
  onFocus = () => {},
  onBlur = () => {},
  onKeyDown = () => {},
  className,
}) => {
  return (
    <Form className="cstm_search" onSubmit={(e) => e.preventDefault()}>
      <div className={`wrap_seacrh_bar ${className}`}>
        {isIcon && (
          <div className="magnifier-wrapper">
            <CiSearch onClick={onClick} />
          </div>
        )}
        <Form.Control
          type="search"
          placeholder="Search..."
          className="me-2 input"
          aria-label="Search"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur} // Delay to allow clicking
          onKeyDown={onKeyDown}
        />
        {!isIcon && <CiSearch onClick={onClick} />}
      </div>
      {isIcon && children}
    </Form>
  );
};
