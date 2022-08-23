import { MINIMUM_PASSWORD_SIZE as min_pwd_size } from "./app.constant";

export const INVALID_CREDENTIALS = "Invalid credentials";
export const LOGIN_SUCCESSFUL = "Logged in successfully";
export const NOT_FOUND = "Not found";
export const AN_ERROR_OCCURRED = "An error occurred";
export const UPDATE_SUCCESSFUL = "Update successful";
export const DELETED_SUCCESSFULLY = "Deleted successfully";
export const ADMIN_CREATED_SUCCESSFULLY = "Admin created successfully";
export const APARTMENT_CREATED_SUCCESSFULLY = "Apartment created successfully";
export const TENANT_CREATED_SUCCESSFULLY = "Tenant added successfully";
export const CASH_ADDED_SUCCESSFULLY = "Cash deposited successfully";
export const RENT_ADDED_SUCCESSFULLY = "Rent added successfully";
export const KIN_IS_REQUIRED = "Kin is required";
export const ID_PARAMETER_REQUIRED = "Parameter ID is required";
export const ROOM_NUMBER_REQUIRED = "Room number is required";
export const PRICE_REQUIRED = "Price is required";
export const AMOUNT_REQUIRED = "Amount is required";
export const USERNAME_REQUIRED = "Username is required";
export const FULL_NAME_REQUIRED = "Full name is required";
export const EMAIL_REQUIRED = "Email is required";
export const PHONE_REQUIRED = "Phone number is required";
export const DOB_REQUIRED = "Date of birth is required";
export const PREVIOUS_ADDRESS_REQUIRED =
  "Previous resident address is required";
export const PASSWORD_REQUIRED = `Password must be of at least ${min_pwd_size} characters, and contain at least one uppercase, lowercase and a number`;
export const APARTMENT_IS_OCCUPIED = "Apartment is occupied";
export const DATABASE_CONNECTED = "Database connected successfully";
export const DATABASE_NOT_CONNECTED = "Database not connected successfully";
export const INVALID_ROOM_NUMBER = "Invalid room number";
export const INVALID_PRICE = "Invalid price, price must be numbers";
export const FORBIDDEN = "Forbidden";
export const UNAUTHORIZED = "Unauthorized";
export const REQUEST_TOKEN = "Kindly request for a new token by logging in";
export const LOGIN_IN = "Provide unique credentials for signup or login";