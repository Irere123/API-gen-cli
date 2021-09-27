import { MiddlewareFn } from "type-graphql";

import { MyContext } from "src/types/MyContext";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  // @ts-ignore
  if (!context.req.session!.userId) {
    throw new Error("Not authenticated");
  }

  return next();
};
