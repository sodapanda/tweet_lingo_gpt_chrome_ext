import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import type { FC } from "react"
import { useState } from "react"

import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"

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
  const tweetHolder = anchor.element

  const mPort = usePort("tweetport")

  return (
    <button
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

        const tweet = getLeafNodeTextContent(tweetHolder)

        mPort.send({
          tweetContent: tweet
        })
      }}>
      生成解释
    </button>
  )
}

export default PlasmoInline
