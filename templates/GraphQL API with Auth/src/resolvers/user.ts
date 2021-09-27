import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Field,
  ObjectType,
} from "type-graphql";
import bcrypt from "bcryptjs";

import { User } from "../entity/User";
import { MyContext } from "../types/MyContext";
import { isAuth } from "../utils/isAuth";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field()
  ok?: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  @UseMiddleware(isAuth)
  allUsers(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | null> {
    // @ts-ignore
    if (!ctx.req.session!.userId) {
      return null;
    }

    // @ts-ignore
    return await User.findOne(ctx.req.session!.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);

    if (username === "") {
      return {
        ok: false,
        errors: [
          {
            field: "username",
            message: "username must not be empty",
          },
        ],
      };
    }

    if (password.length < 5) {
      return {
        ok: false,
        errors: [
          {
            field: "password",
            message: "password must be greater than 5 characters.",
          },
        ],
      };
    }

    let user;

    try {
      const dbUser = await User.create({
        username,
        password: hashedPassword,
        email,
      }).save();

      user = dbUser;
    } catch (err) {
      const { detail } = err;

      if (detail.includes("email")) {
        if (detail.includes("already exists.")) {
          return {
            ok: false,
            errors: [
              {
                field: "email",
                message: "email already taken",
              },
            ],
          };
        }
      }
    }

    // @ts-ignore
    req.session!.userId = user.id;

    return {
      ok: true,
    };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        ok: false,
        errors: [
          {
            field: "email",
            message: "Invalid login",
          },
        ],
      };
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return {
        ok: false,
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // @ts-ignore
    ctx.req.session!.userId = user.id;

    return {
      ok: true,
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    return new Promise((res, rej) =>
      ctx.req.session.destroy((error) => {
        if (error) {
          console.log(error);
          return rej(false);
        }

        ctx.res.clearCookie("_qid");
        return res(true);
      })
    );
  }
}
