import type { OpenAI } from "../../../types.ts"
import { genModel, openAiMessageToGeminiMessage } from "../../../utils.ts"
import { ChatProxyHandlerType } from "./ChatProxyHandler.ts"

export const nonStreamingChatProxyHandler: ChatProxyHandlerType = async (
  c,
  req,
  genAi,
) => {
  const log = c.var.log
  const model = genModel(genAi, req)
  const geminiResp: string = await model
    .generateContent({
      contents: openAiMessageToGeminiMessage(req.messages),
    })
    .then((it) => it.response.text())
    .catch((err) => {
      // 出现异常时打印请求参数和响应，以便调试
      log.error(req)
      log.error(err?.message ?? err.toString())
      return err?.message ?? err.toString()
    })

  log.debug(geminiResp)

  const resp: OpenAI.Chat.ChatCompletion = {
    id: "chatcmpl-abc123",
    object: "chat.completion",
    created: Date.now(),
    model: req.model,
    choices: [
      {
        message: { role: "assistant", content: geminiResp },
        logprobs: null,
        finish_reason: "stop",
        index: 0,
      },
    ],
  }
  return c.json(resp)
}
