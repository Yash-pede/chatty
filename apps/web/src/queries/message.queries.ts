import { sentMessage } from "@repo/db/types";

export const sendMessage = async (messagePayload: sentMessage) => {
  console.log(messagePayload);
};