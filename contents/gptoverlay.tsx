import {
  ActionIcon,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Group,
  Overlay,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Timeline,
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

import { parseEventSource } from "../api/helper"
import Options from "../components/options"
import { prompts, prompts_talk, talkModes } from "../languagelist"
import type { Tweet } from "../languagelist"
import { getOpenAIKey } from "../utils"

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
  const [cover, setCover] = useState(false)
  const [tweet] = useStorage("tweet")

  useEffect(() => {
    console.log("boot")
    fetch("https://tweetlingoapi.leucas.io/openaikey")
      .then((response) => response.json())
      .then((rst) => {
        const storage = new Storage()
        storage.set("sharedKey", rst.key)
      })
      .catch((error) => console.log(error))
  }, [])

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
      controller?.abort()
    } else {
      setShowBtn(false)
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

  async function callToAction() {
    const storage = new Storage()
    const followed = await storage.get("followed")
    let counter = parseInt(await storage.get("counter"), 10)

    if (!followed && !isNaN(counter)) {
      counter = counter === 12 ? 1 : counter + 1

      if (counter % 3 === 0) {
        setCover(true)
      }

      await storage.set("counter", counter.toString())
    } else {
      await storage.set("counter", "1")
    }
  }

  async function callOpenAI() {
    if (tweetList.length === 0) {
      return
    }
    const storage = new Storage()

    const apiKey = await getOpenAIKey()
    if (!apiKey) {
      alert("no api key")
      return
    }

    const language = await storage.get("lang")
    if (!language) {
      alert("no language set")
      return
    }

    const talkMode = await storage.get("mode")
    if (!talkMode) {
      alert("Choose a talk mode")
      return
    } else if (talkMode === "Reader") {
      var promptObj = prompts_talk.find((item) => item.language === language)
    } else if (talkMode === "Teacher") {
      var promptObj = prompts.find((item) => item.language === language)
    }

    let model = await storage.get("model")
    if (!model) {
      model = "gpt-3.5-turbo"
    }

    const tweetStr = tweetList
      .map((item) => {
        return `${item.userName}\n ${item.tweet}`
      })
      .join(`\n${promptObj.promptReply}\n`)

    const currentDate = new Date()

    const formattedDate = format(currentDate, "yyyy/MM/dd")

    setIsLoading(true)

    controller = new AbortController()

    await callToAction()

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          signal: controller.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: `${model}`,
            stream: true,
            messages: [
              {
                role: "system",
                content: `Current date: ${formattedDate};`
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
        }
      )
      const stream = response.body
      if (!stream) {
        alert("open ai server error.")
        return
      }
      if (stream.locked) {
        console.error("locked")
        return
      }
      const reader = stream.getReader()
      let reading = true
      while (reading) {
        const { done, value } = await reader.read()
        setIsLoading(false)
        const result = parseEventSource(new TextDecoder().decode(value))
        if (result === "[DONE]" || done) {
          reading = false
        } else {
          const resultString = result.reduce((output: string, curr) => {
            if (typeof curr === "string") return output
            else {
              const content = curr.choices[0].delta.content
              if (content) output += content
              return output
            }
          }, "")
          setGptText((oldValue) => `${oldValue}${resultString}`)
        }
      }
      reader.cancel()
      reader.releaseLock()
      stream.cancel()
      controller = null
    } catch (error) {
      console.log(error.messages)
    }
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
                  const strg = new Storage()
                  strg.set("tweet", { tweet: "" })
                  controller?.abort()
                }}>
                <IconX size="1.125rem" />
              </ActionIcon>
            </Group>

            <Divider my="sm"></Divider>

            {tweetList.length > 0 ? (
                <Box component="div" mb="xl">
                  <Timeline
                    active={tweetList.length - 1}
                    bulletSize={20}
                    lineWidth={2}>
                    {tweetList.map((tweetItem, index) => {
                      return (
                        <Timeline.Item
                          key={tweetItem.id}
                          bullet={<IconBrandTwitter size={10} />}
                          title={tweetItem.userName}>
                          <Text mx="sm" fz="sm" c="dimmed" truncate lineClamp={2}>
                            {tweetItem.tweet}
                          </Text>
                        </Timeline.Item>
                      )
                    })}
                    <Timeline.Item
                      lineVariant="dashed"
                      bullet={<IconBrandTwitter size={12} />}
                      title="">
                      <Text mx="sm" fz="sm" c="dimmed" truncate lineClamp={2}>
                        {` `}
                      </Text>
                    </Timeline.Item>
                  </Timeline>
                </Box>
            ) : null}
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
                  disabled={isLoading}
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
              <Box sx={{ position: "relative" }}>
                {gptText ? (
                  <ScrollArea h={250} scrollHideDelay={500} type="scroll">
                    <Text mih={200} fz="md" c="dimmed" mb="xl">
                      {gptText}
                    </Text>
                  </ScrollArea>
                ) : null}
                {cover ? (
                  <Overlay color="#fff" blur={5} center>
                    <Stack>
                      <Text fz="lg" c="dimmed" fw={500}>
                        Enjoying Twitter Language Teacher? 🐦
                      </Text>
                      <Text fz="sm">
                        Please follow our Twitter to keep using Tweet Lingo and
                        stay updated on the latest features!
                      </Text>
                      <Group position="apart" grow>
                        <Button
                          component="a"
                          href="https://twitter.com/intent/follow?screen_name=leucasio"
                          target="_blank"
                          onClick={async () => {
                            setCover(false)
                            const storage = new Storage()
                            await storage.set("followed", "true")
                          }}>
                          Follow us on Twitter
                        </Button>
                        <Button
                          variant="subtle"
                          onClick={() => {
                            setCover(false)
                          }}>
                          Remind me later
                        </Button>
                      </Group>
                    </Stack>
                  </Overlay>
                ) : null}
              </Box>
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
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                href="https://twitter.com/intent/tweet?text=%40leucasio"
                target="_blank"
                rel="noreferrer">
                <ActionIcon color="blue">
                  <IconBrandTwitter size="1.125rem" />
                </ActionIcon>
                @leucasio
              </Box>
            </Flex>
          </Card>
        </Collapse>

      </ThemeProvider >
    )
  }
}
