// UserService.ts

import { NewsletterService } from "./NewsletterService";
import { DatabaseService } from "./DatabaseService";

// EXTRA IMPORTS FOR CUSTOM-ERR. HANDLING
import { CustomLogger } from "../../utils/CustomLogger";
import { AppCodes } from "../../utils/AppCodes";
import { CustomError } from "../../utils/CustomError";
import { HttpCodes } from "../../utils/HttpCodes";

export class UserService {
  constructor(
    private name: string,
    private email: string,
  ) {}

  async registerUser(): Promise<{ msg: string }> {
    try {
      const user = await DatabaseService.createUser(this.name, this.email);
      await NewsletterService.subscribeUser(user);

      // ADD CUSTOM LOGGER
      CustomLogger.info(
        "UserService registerUser",
        AppCodes.REGISTER_USER_SUCCESS,
        { user },
      );

      return { msg: "user registered successfully" };
    } catch (error) {
      // throw new Error("User registration failed");
      // THROW CUSTOM ERROR
      CustomError.throwError(
        HttpCodes.INTERNAL_SERVER_ERROR,
        AppCodes.REGISTER_USER_FAILED,
        "failed to register user",
      );
    }
  }
}
