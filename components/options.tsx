import {
  ActionIcon,
  Button,
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

import { prompts } from "../languagelist"

interface OptProps {
  onSaveConfig: () => void
}

function Options(props: OptProps) {
  const [openAiApiKey, setApiKey] = useState("")
  const [outputLang, setOutputLang] = useState<string | null>(null)

  const storage = new Storage()

  const topTenLanguages: string[] = prompts.map((item) => item.language)

  useEffect(() => {
    storage
      .get("apikey")
      .then((apikey) => {
        if (apikey) {
          setApiKey(apikey)
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
  }, [])
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
          Tweet Lingo
        </Text>
      </Flex>
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
      <Flex mt={100} mb={"xs"} direction="row" justify="flex-end">
        <Button
          disabled={!openAiApiKey || !outputLang}
          mx="xs"
          onClick={async () => {
            await storage.set("apikey", openAiApiKey)
            await storage.set("lang", outputLang)

            props.onSaveConfig()
          }}>
          save
        </Button>
      </Flex>
    </Container>
  )
}

export default Options
