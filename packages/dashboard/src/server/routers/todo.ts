import { baseProcedure, router } from "../trpc";

export const todoRouter = router({
  all: baseProcedure.query(({ ctx }) => {
    return [
      {
        id: "1",
        text: "Hello",
        completed: false,
      },
      {
        id: "2",
        text: "World",
        completed: true,
      },
    ];
  }),
});
