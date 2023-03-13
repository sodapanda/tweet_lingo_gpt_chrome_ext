import {
  ActionIcon,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Group,
  Paper,
  Skeleton,
  Text,
  createEmotionCache
} from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import {
  IconBrandTwitter,
  IconClearAll,
  IconCopy,
  IconX
} from "@tabler/icons-react"
import { format } from "date-fns"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"

import { ThemeProvider } from "~theme"

import Options from "../components/options"
import { prompts } from "../languagelist"

interface Tweet {
  tweet: string
  id: string
  userName: string
}

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

export default function GptOverlay() {
  const mPort = usePort("tweetport")
  const clipboard = useClipboard({ timeout: 500 })

  const [show, setShow] = useState(false)
  const [gptText, setGptText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [tweetList, setTweetList] = useState<Tweet[]>([])

  useEffect(() => {
    setShow(mPort.data?.tweetContent ? true : false)

    if (mPort.data?.noConfig) {
      setShowConfig(true)
    } else {
      setShowConfig(false)
    }

    addToList(mPort.data?.tweetContent, mPort.data?.userName)
  }, [mPort.data])

  function addToList(tweet: string, userName: string) {
    if (!tweet) {
      return
    }
    const newList = tweetList.slice()
    newList.push({
      tweet: tweet,
      userName: userName,
      id: new Date().getTime().toString()
    })
    setTweetList(newList)
  }

  function delFromList(id: string) {
    let newList = tweetList.slice()
    newList = newList.filter((item) => item.id !== id)
    console.log(newList)
    setTweetList(newList)
  }

  function clearList() {
    let newList = []
    setTweetList(newList)
    setGptText("")
  }

  async function callOpenAI() {
    if (tweetList.length === 0) {
      return
    }
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

    const promptObj = prompts.find((item) => item.language === language)
    const tweetStr = tweetList
      .map((item) => {
        return `${item.userName}\n ${item.tweet}`
      })
      .join(`\n${promptObj.promptReply}\n`)

    const currentDate = new Date()

    const formattedDate = format(currentDate, "yyyy/MM/dd")

    setIsLoading(true)

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
      })
      .catch((error) => {
        console.log(error)
        setIsLoading(false)
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
                color="gray"
                radius="lg"
                onClick={() => {
                  clearList()
                }}>
                <IconClearAll size="1.125rem" />
              </ActionIcon>
              <ActionIcon
                color="blue"
                radius="lg"
                variant="filled"
                onClick={() => {
                  clearList()
                  mPort.send({
                    tweetContent: ""
                  })
                }}>
                <IconX size="1.125rem" />
              </ActionIcon>
            </Group>
            {tweetList.map((tweetItem, index) => {
              return (
                <Flex
                  mb="sm"
                  key={tweetItem.id}
                  justify="flex-start"
                  align="center"
                  direction="row">
                  <Text>{`${index}`}</Text>
                  <Text>{`${tweetItem.userName}`}</Text>
                  <Paper mx="sm">{tweetItem.tweet}</Paper>
                  <Button
                    onClick={() => {
                      delFromList(tweetItem.id)
                    }}>
                    delete
                  </Button>
                </Flex>
              )
            })}

            <Divider my="sm" variant="dashed"></Divider>
            <Button
              onClick={() => {
                callOpenAI()
              }}>
              Do
            </Button>

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
              <Text size="sm" color="dimmed" mb="xl">
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
