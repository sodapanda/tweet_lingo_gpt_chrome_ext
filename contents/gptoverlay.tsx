import {
  ActionIcon,
  Box,
  Card,
  Collapse,
  Flex,
  Group,
  Skeleton,
  Text,
  createEmotionCache
} from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { IconBrandTwitter, IconCopy, IconX } from "@tabler/icons-react"
import { format } from "date-fns"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"

import { ThemeProvider } from "~theme"

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

  useEffect(() => {
    console.log(`get msg ${mPort.data}`)
    setShow(mPort.data ? true : false)

    callOpenAI(mPort.data)
  }, [mPort.data])

  async function callOpenAI(tweet: string) {
    if (!tweet) {
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
        setGptText(data.choices[0].message.content)
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setIsLoading(false)
      })
  }

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
                mPort.send({
                  tweetContent: ""
                })
              }}>
              <IconX size="1.125rem" />
            </ActionIcon>
          </Group>
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
