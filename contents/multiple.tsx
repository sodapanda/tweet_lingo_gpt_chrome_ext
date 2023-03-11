import { Box, Button, Paper, Text, createEmotionCache } from "@mantine/core"
import { format } from "date-fns"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import type { FC } from "react"
import { useState } from "react"

import { Storage } from "@plasmohq/storage"

import { ThemeProvider } from "~theme"

export const getStyle = () => document.createElement("style")
export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () => {
  const shareButtonList = document.querySelectorAll('[data-testid="tweetText"]')
  return shareButtonList
}
export const getShadowHostId = () => {
  return "tweet-inline-ext-id"
}

function getLeafNodeTextContent(rootElement: any): string {
  let leafNodeTextContent = ""
  const stack = [rootElement]

  while (stack.length > 0) {
    const currentElement = stack.pop()
    // console.log(`当前element 是 ${currentElement.tagName}`)

    let textContent = currentElement.textContent || ("" as string)
    if (currentElement.tagName === "IMG") {
      // 如果当前元素是图片，则获取其 alt 属性 为了处理emoji
      // twitter的emoji是图片格式的，但是alt里边是emoji字符
      textContent = currentElement.getAttribute("alt") || ""
    }

    if (currentElement.childNodes.length === 0) {
      leafNodeTextContent = `${
        textContent ? textContent : ""
      }${leafNodeTextContent}`
      // console.log(
      //   ` 找到叶子节点 ${currentElement.tagName}${currentElement.textContent} - ${leafNodeTextContent}`
      // )
    } else {
      const childNodes = Array.from(currentElement?.childNodes || [])
      stack.push(...childNodes)
    }
  }

  return leafNodeTextContent
}

const PlasmoInline: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const styleCache = createEmotionCache({
    key: "plasmo-mui-cache",
    prepend: true,
    container:
      anchor.element.nextElementSibling.shadowRoot.querySelector("style")
  })

  const tweetHolder = anchor.element
  const [extMsg, setExt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  return (
    <ThemeProvider emotionCache={styleCache}>
      <Box component="div">
        {extMsg ? (
          <Paper shadow="sm" radius="md" p="md" withBorder>
            <Text>{extMsg}</Text>
          </Paper>
        ) : (
          <Button
            loading={isLoading}
            onClick={async (event) => {
              event.stopPropagation()
              const storage = new Storage({
                area: "local"
              })

              const apiKey = await storage.get("apikey")
              if (!apiKey) {
                alert("no api key")
                return
              }

              const language = await storage.get("lang")
              if (!language) {
                alert("no language set")
                return
              }

              setIsLoading(true)

              const tweet = getLeafNodeTextContent(tweetHolder)

              const currentDate = new Date()

              const formattedDate = format(currentDate, "yyyy/MM/dd")

              fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: "gpt-3.5-turbo",
                  messages: [
                    {
                      role: "system",
                      content: `Current date: ${formattedDate}; reply in language: ${language}`
                    },
                    {
                      role: "user",
                      content: `这是我读到的一条推文:\n ${tweet}`
                    },
                    {
                      role: "user",
                      content: `解释这条推文要表达的意思。必要时请加入背景信息介绍。`
                    }
                  ]
                })
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log(data)
                  setExt(data.choices[0].message.content)
                  setIsLoading(false)
                })
                .catch((error) => {
                  console.log(error)
                  setIsLoading(false)
                })
            }}>
            生成解释
          </Button>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default PlasmoInline
