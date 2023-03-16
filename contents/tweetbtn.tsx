import { IconBrandOpenai, IconPlus } from "@tabler/icons-react"
import cssText from "data-text:~/contents/tweetbtn.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import type { FC } from "react"
import { useState } from "react"

import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
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
    } else {
      const childNodes = Array.from(currentElement?.childNodes || [])
      stack.push(...childNodes)
    }
  }

  return leafNodeTextContent
}

function getUserHandle(anchor: Element) {
  const tweetRoot = anchor.closest("article[data-testid='tweet']")
  const userNameNode = tweetRoot.querySelector('div[data-testid="User-Name"]')
  let userName = getLeafNodeTextContent(userNameNode)
  if (userName?.includes("·")) {
    userName = userName?.split("·")[0]
  }
  return userName
}

const PlasmoInline: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const tweetHolder = anchor.element

  const [isHovered, setIsHovered] = useState(false)
  const handleMouseEnter = () => {
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      className="tweenbtnholder"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={async (event) => {
        event.stopPropagation()
        const strg = new Storage()

        const apiKey = await strg.get("apikey")
        if (!apiKey) {
          strg.set("tweet", { noConfig: true })
          return
        }

        const language = await strg.get("lang")
        if (!language) {
          strg.set("tweet", { noConfig: true })
          return
        }

        const userName = getUserHandle(tweetHolder)
        const tweet = getLeafNodeTextContent(tweetHolder)

        strg.set("tweet", { tweet: tweet, userName: userName })
      }}>
      {isHovered ? (
        <IconPlus size={24} color="#74ac9e" stroke={1.6} />
      ) : (
        <IconBrandOpenai size={24} color="#74ac9e" stroke={1.6} />
      )}
    </div>
  )
}

export default PlasmoInline
