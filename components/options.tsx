import {
  Box,
  Button,
  Container,
  Flex,
  PasswordInput,
  Select,
  rem
} from "@mantine/core"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

function Options() {
  const [openAiApiKey, setApiKey] = useState("")
  const [outputLang, setOutputLang] = useState<string | null>(null)

  const storage = new Storage({
    area: "local"
  })

  const topTenLanguages: string[] = [
    "Chinese",
    "Spanish",
    "English",
    "Hindi",
    "Arabic",
    "Portuguese",
    "Bengali",
    "Russian",
    "Japanese",
    "Punjabi"
  ]

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
      <Box
        component="div"
        sx={(theme) => ({
          backgroundImage: theme.fn.gradient({
            from: "blue",
            to: "teal",
            deg: 20
          }),
          height: rem("4rem")
        })}></Box>
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
        label="Choose your main language."
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

            window.close()
          }}>
          save
        </Button>
      </Flex>
    </Container>
  )
}

export default Options