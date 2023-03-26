import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Flex,
  PasswordInput,
  Select,
  Text,
  rem
} from "@mantine/core"
import { IconBrandOpenai } from "@tabler/icons-react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { prompts, talkModes } from "../languagelist"

interface OptProps {
  onSaveConfig: () => void
}

function Options(props: OptProps) {
  const [openAiApiKey, setApiKey] = useState("")
  const [isUseSelfKey, setUseSelfKey] = useState(false)
  const [outputLang, setOutputLang] = useState<string | null>(null)
  const [talkMode, setTalkMode] = useState<string>("Teacher")
  const [model, setModel] = useState("gpt-3.5-turbo")

  const storage = new Storage()

  const topTenLanguages: string[] = prompts.map((item) => item.language)

  const allTalkModes: string[] = talkModes.map((item) => item.mode)

  useEffect(() => {
    storage
      .get("apikey")
      .then((apikey) => {
        if (apikey) {
          setApiKey(apikey)
          setUseSelfKey(true)
        }
      })
      .catch((error) => {
        console.error(error)
      })

    storage
      .get("lang")
      .then((lang) => {
        if (lang) {
          setOutputLang(lang)
        }
      })
      .catch((error) => {
        console.error(error)
      })

    storage
      .get("mode")
      .then((mode) => {
        if (mode) {
          setTalkMode(mode)
        }
      })
      .catch((error) => {
        console.error(error)
      })

    storage.get("model").then((savedModel) => {
      if (savedModel) {
        setModel(savedModel)
      }
    })
  }, [])

  useEffect(() => {
    if (!isUseSelfKey) {
      storage.set("apikey", "").then((res) => { })
      setApiKey("")
    }
  }, [isUseSelfKey])

  return (
    <Container miw={420} px={0}>
      <Flex
        gap="sm"
        justify="flex-start"
        align="center"
        direction="row"
        wrap="nowrap"
        sx={(theme) => ({
          backgroundImage: theme.fn.gradient({
            from: "blue",
            to: "teal",
            deg: 20
          }),
          height: rem("4rem")
        })}>
        <ActionIcon ml="sm" color="cyan" size="xl" radius="xl" variant="filled">
          <IconBrandOpenai size="2.125rem" />
        </ActionIcon>
        <Text
          sx={{ fontFamily: "Greycliff CF, sans-serif" }}
          ta="center"
          c="white"
          fz="xl"
          fw={700}>
          GPT Language Teacher
        </Text>
      </Flex>

      <Select
        mt="xs"
        withAsterisk
        mx="xs"
        label="Select your main language"
        placeholder="Pick one"
        radius="md"
        size="sm"
        searchable
        nothingFound="No options"
        value={outputLang}
        onChange={setOutputLang}
        data={topTenLanguages}
        maxDropdownHeight={120}
      />

      <Select
        mt="xs"
        withAsterisk
        mx="xs"
        label="Select interpretation mode"
        placeholder="Reader"
        radius="md"
        size="sm"
        searchable
        nothingFound="Reader"
        value={talkMode}
        onChange={setTalkMode}
        data={allTalkModes}
        maxDropdownHeight={120}
      />

      <Checkbox
        mx="xs"
        mt="xs"
        checked={isUseSelfKey}
        onChange={(event) => setUseSelfKey(event.currentTarget.checked)}
        label="Use my own OpenAI API Key"
      />

      {isUseSelfKey ? (
        <PasswordInput
          mx="xs"
          mt="xs"
          placeholder="sk-xxxxx"
          label="API Key"
          variant="filled"
          radius="md"
          size="sm"
          withAsterisk
          value={openAiApiKey}
          onChange={(event) => {
            setApiKey(event.currentTarget.value)
          }}
        />
      ) : null}

      <Flex mt={100} mb={"xs"} direction="row" justify="flex-end">
        <Button
          disabled={(isUseSelfKey && !openAiApiKey) || !outputLang}
          mx="xs"
          onClick={async () => {
            await storage.set("apikey", openAiApiKey)
            await storage.set("lang", outputLang)
            await storage.set("model", model)
            await storage.set("mode", talkMode)

            props.onSaveConfig()
          }}>
          save
        </Button>
      </Flex>
    </Container>
  )
}

export default Options
