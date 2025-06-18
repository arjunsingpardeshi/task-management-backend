import { body } from "express-validator";

const userRegistrationValidator = () =>{

    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body('username')
            .notEmpty().withMessage("Username is required")
            .isLength({min: 3}).withMessage("Username should be at least 3 char")
            .isLength({max: 13}).withMessage("Username cannot exceed 13 char"),
        body('password')
            .notEmpty().withMessage("Password cannot be empty"),
        body("fullname")
            .notEmpty().withMessage("Fullname is required")
            .isLength({min:6}).withMessage("Fullname should be at least 6 char")
            .isLength({max: 20}).withMessage("Fullname cannot exceed 20 char")

    ];
}

const userLoginValidator = () => {

    return [
        body("email")
            .isEmail().withMessage("Email is not valid"),
        body("password")
            .notEmpty().withMessage("Password cannot be empty")
    ];
}

export {userRegistrationValidator, userLoginValidator}