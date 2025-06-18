
import dotenv from "dotenv"
import crypto from "crypto"
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailGenContent, forgotPasswordMailGenContent, sendEmail } from "../utils/mail.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

dotenv.config();
const registerUser = asyncHandler(async (req, res) => {

  const { email, username, fullname, password } = req.body;
  const existingUser = await User.findOne({ email });
  console.log(`existing user = `, existingUser);

  if (existingUser) {
    throw new ApiError(400, "user already exist");
  }

  console.log(`req.file = `, req.file);
  const avatarLocalPath = req.file?.path;
  //const coverImageLocalPath = req.file?.coverImage[0].path;
  console.log(`avatar local path = `, avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("avatar = ", avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }
  const user = await User.create({
    username,
    password,
    email,
    fullname,
    avatar: {
      url: avatar.secure_url,
      localpath: avatarLocalPath
    }
  });
  // console.log("user is ",user);

  //const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!user) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  //const token = crypto.randomBytes(32).toString("hex");
  //const tokenExpiry = Date.now() + 15 * 60 * 1000;
  //console.log("verification token = ",token);

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  //const token = unHashedToken;
  //console.log("verification token = ", token);

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry
  await user.save();

  const verificationURL = `${process.env.BASE_URI}/api/v1/auth/verify/${unHashedToken}`;
  console.log("send mail url = ", verificationURL);

  await sendEmail({ email: user.email, subject: "verify email", mailGenContent: emailVerificationMailGenContent(user.username, verificationURL) });

  res.status(200).json(new ApiResponse(200, { user_name: user.name, email: user.email }, "user registered successfully"))
});


const verifyUser = asyncHandler(async (req, res) => {

  const { token } = req.params;
  console.log("token is = ", token);

  if (!token) {
    throw new ApiError(400, "invalid token");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "invalid token");
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, "user verification is success"));

});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Your email is alredy verified")
  }
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry

  const reVerificationURL = `${process.env.BASE_URI}/api/v1/auth/verify/${unHashedToken}`;

  await sendEmail({ email: user.email, subject: "verify email", mailGenContent: emailVerificationMailGenContent(user.username, reVerificationURL) });

  res.status(200).json(new ApiResponse(200, { user_name: user.name, email: user.email }, " resend verification email successfully"))


});




const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const user = User.findOne({ email });

  if (!email) {
    throw new ApiError(404, "account not found");
  }
  const isMatched = await user.isPasswordCorrect(password);
  if (!isMatched) {
    throw new ApiError(404, "invalid user and password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();

  const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000  //15 days
  };
  res.status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption).json(new ApiResponse(200, "login successfully"));

});
    
const logoutUser = asyncHandler(async (req, res) => {

  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    throw new ApiError(400, "unauthorized access")
  }

  const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000  //15 days
  };
  user.refreshToken = undefined;
  await user.save();
  res.clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .status(200).json(new ApiResponse(200, "logout successfully"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.forgotPasswordToken = token;
  user.forgotPasswordExpiry = Date.now() + (10 * 60 * 1000);
  await user.save();

  const forgotPasswordRequestURL = `${process.env.BASE_URI}/api/v1/auth/reset-password/${token}`

  await sendEmail({ email: user.email, subject: "forgot password request", mailGenCOntent: forgotPasswordMailGenContent(user.username, forgotPasswordRequestURL) })

  res.status(201).json(new ApiResponse(201, "forgot password link is share successfully"))
});


const resetForgottenPassword = asyncHandler(async (req, res) => {

  const { token } = req.params;

  const { newPassword, verifyNewPassword } = req.body;

  if (password !== verifyPassword) {
    throw new ApiError(400, "Please enter same password in both field")
  }

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordExpiry: {gt: Date.now()}
  });
  if(!user){
    throw new ApiError(400, "user not found")
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  res.status(201).json(new ApiResponse(201, "password reset successfully"))

});

const changeCurrentPassword = asyncHandler(async (req, res) => {


  
  const {email, password} = req.body;

  const user = await User.findOne({email});

  
  if(!user){
    throw new ApiError(404, "user not found");
  }

  const isMatched = user.isPasswordCorrect(password);

  if(!isMatched){
    throw new ApiError(404, "invalid email id and password");
  }

  const {newPasswaord, newReEnterPassword} = req.body;

  if(newPasswaord !== newReEnterPassword){
    throw new ApiError(400, "please provide same password in both field") 
  }

  user.password = newPasswaord;
  await user.save();

  res.status(200).json(new ApiResponse(200, "password change successfully"))
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  
  const previousRefreshToken = req.cookies?.refreshToken;
  
  const decoded = jwt.verify(previousRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded._id)
  
  if(!user){
    throw new ApiError(404, "invalid refresh token")
  }

  if(previousRefreshToken!==user.refreshToken){
    throw new ApiError(401, "refresh token is expire")
  }
  const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000  //15 days
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();
  res.status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption).json(new ApiResponse(200, "access token refresh successfully"));

});



const getCurrentUser = asyncHandler(async (req, res) => {
  const id = req.user?._id;
  const user = await User.findOne({id}).select("-password -refreshToken");

    if(!user){

      throw new ApiError(404, "user not found");
    }
    res.status(200).json(new ApiResponse(200, user))

});

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  resendEmailVerification,
  resetForgottenPassword,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  getCurrentUser
}