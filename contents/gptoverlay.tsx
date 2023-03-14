import {
  ActionIcon,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Group,
  Skeleton,
  Text,
  createEmotionCache
} from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import {
  IconBrandOpenai,
  IconBrandTwitter,
  IconCopy,
  IconTrash,
  IconX
} from "@tabler/icons-react"
import { format } from "date-fns"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { ThemeProvider } from "~theme"

import Options from "../components/options"
import { prompts } from "../languagelist"
import type { Tweet } from "../languagelist"

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"]
}

const styleElement = document.createElement("style")

const styleCache = createEmotionCache({
  key: "plasmo-mantine-cache",
  prepend: true,
  container: styleElement
})

export const getStyle = () => styleElement

let controller: AbortController = null

export default function GptOverlay() {
  const clipboard = useClipboard({ timeout: 500 })

  const [show, setShow] = useState(false)
  const [gptText, setGptText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [tweetList, setTweetList] = useState<Tweet[]>([])
  const [showGptBtn, setShowBtn] = useState(true)
  const [tweet] = useStorage("tweet")

  useEffect(() => {
    console.log(tweet)
    if (tweet && !tweet.outDated) {
      setShow(!!tweet.tweet)
      setShowBtn(!!tweet.tweet)
      setShowConfig(tweet.noConfig)
      addToList(tweet)
      const strg = new Storage()
      strg.set("tweet", { outDated: true })
    }
  }, [tweet])

  useEffect(() => {
    if (tweetList?.length > 0) {
      setShowBtn(true)
      setGptText("")
    } else {
      setShowBtn(false)
    }
    if (controller) {
      controller.abort()
    }
  }, [tweetList])

  useEffect(() => {
    if (gptText) {
      clearList()
    }
  }, [gptText])

  function addToList(tweet: Tweet) {
    if (!tweet || !tweet.tweet) {
      return
    }

    setTweetList((preList) => {
      return [...preList, { ...tweet, id: new Date().getTime().toString() }]
    })
  }

  function delFromList(id: string) {
    let newList = tweetList.slice()
    newList = newList.filter((item) => item.id !== id)
    setTweetList(newList)
  }

  function clearList() {
    let newList = []
    setTweetList(newList)
  }

  async function callOpenAI() {
    if (tweetList.length === 0) {
      return
    }
    const storage = new Storage()

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

    const promptObj = prompts.find((item) => item.language === language)
    const tweetStr = tweetList
      .map((item) => {
        return `${item.userName}\n ${item.tweet}`
      })
      .join(`\n${promptObj.promptReply}\n`)

    const currentDate = new Date()

    const formattedDate = format(currentDate, "yyyy/MM/dd")

    setIsLoading(true)

    controller = new AbortController()

    fetch("https://api.openai.com/v1/chat/completions", {
      signal: controller.signal,
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
            content: `${promptObj?.promptContent} ${tweetStr}`
          },
          {
            role: "user",
            content: promptObj?.promptAction
          }
        ]
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setGptText(data.choices[0].message.content)
        setIsLoading(false)
        controller = null
      })
      .catch((error) => {
        console.log(error)
        setIsLoading(false)
        controller = null
      })
  }

  if (showConfig) {
    return (
      <ThemeProvider emotionCache={styleCache}>
        <Card
          shadow="xl"
          padding={0}
          radius="md"
          withBorder
          bg="#fff"
          style={{
            position: "fixed",
            bottom: 53,
            right: 20
          }}>
          <Options
            onSaveConfig={() => {
              setShowConfig(false)
            }}
          />
        </Card>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider emotionCache={styleCache}>
        <Collapse in={show}>
          <Card
            shadow="xl"
            padding="lg"
            radius="md"
            withBorder
            w={430}
            style={{
              position: "fixed",
              bottom: 53,
              right: 20
            }}>
            <Group position="apart" mb="xs">
              <Text weight={500}>The explanation of this tweet</Text>
              <ActionIcon
                color="blue"
                radius="lg"
                variant="filled"
                onClick={() => {
                  clearList()
                  // EventBusSt.getInstance().eventbus.emit("my-event", null, {})
                  const strg = new Storage()
                  strg.set("tweet", { tweet: "" })
                }}>
                <IconX size="1.125rem" />
              </ActionIcon>
            </Group>

            <Divider my="sm"></Divider>

            {tweetList.map((tweetItem, index) => {
              return (
                <Group key={tweetItem.id} position="apart" spacing="xs" mb={2}>
                  <Text
                    maw={"80%"}
                    mx="sm"
                    fz="sm"
                    c="dimmed"
                    truncate
                    lineClamp={1}>
                    {tweetItem.tweet}
                  </Text>

                  <ActionIcon
                    disabled={isLoading}
                    variant="light"
                    color="blue"
                    radius="lg"
                    onClick={() => {
                      delFromList(tweetItem.id)
                    }}>
                    <IconTrash size="1.125rem" />
                  </ActionIcon>
                </Group>
              )
            })}

            {showGptBtn ? (
              <Flex
                mt="sm"
                mb="sm"
                justify="center"
                align="center"
                direction="row"
                wrap="nowrap">
                <Divider w={150} my="sm" variant="dashed"></Divider>
                <Button
                  color="teal"
                  size="sm"
                  radius="xl"
                  leftIcon={<IconBrandOpenai />}
                  variant="filled"
                  onClick={() => {
                    callOpenAI()
                  }}>
                  Explain
                </Button>
                <Divider w={150} my="sm" variant="dashed"></Divider>
              </Flex>
            ) : null}

            {isLoading ? (
              <Box component="div" mb="xl">
                <Skeleton height={8} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} width="70%" radius="xl" />
              </Box>
            ) : (
              <Text size="sm" mb="xl">
                {gptText}
              </Text>
            )}

            <Flex
              gap="sm"
              justify="flex-end"
              align="center"
              direction="row"
              wrap="nowrap">
              <ActionIcon
                color="blue"
                onClick={() => {
                  clipboard.copy(gptText)
                }}>
                <IconCopy size="1.125rem" />
              </ActionIcon>
              <Box
                component="a"
                href="https://twitter.com/leucasio"
                target="_blank"
                rel="noreferrer">
                <ActionIcon color="blue">
                  <IconBrandTwitter size="1.125rem" />
                </ActionIcon>
              </Box>
            </Flex>
          </Card>
        </Collapse>
      </ThemeProvider>
    )
  }
}
