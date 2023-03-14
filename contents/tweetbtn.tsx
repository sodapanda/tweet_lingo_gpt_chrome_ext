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

function findAncestor(el: any) {
  let parentNode = el.parentNode
  while (
    parentNode &&
    parentNode.tagName !== "ARTICLE" &&
    parentNode.getAttribute("data-testid") !== "tweet"
  ) {
    parentNode = parentNode.parentNode
  }

  return parentNode
}

function findElementByTestId(element, testId) {
  if (
    element.tagName === "DIV" &&
    element.hasAttribute("data-testid") &&
    element.getAttribute("data-testid") === testId
  ) {
    // 如果找到了具有所需测试ID的元素，则返回该元素。
    return element
  } else {
    // 遍历子节点
    for (let i = 0; i < element.childNodes.length; i++) {
      const childNode = element.childNodes[i]
      // 递归查找子节点
      const result = findElementByTestId(childNode, testId)
      if (result) {
        // 如果找到了所需的元素，则将其返回。
        return result
      }
    }
  }
  // 如果遍历完所有的子节点仍然没有找到所需的元素，则返回null。
  return null
}

function getUserHandle(rootElement: any) {
  const tweetRoot = findAncestor(rootElement)
  const userNameNode = findElementByTestId(tweetRoot, "User-Names")
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
