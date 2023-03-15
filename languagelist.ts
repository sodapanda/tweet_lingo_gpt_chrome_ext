export const prompts = [
  {
    language: "Chinese",
    promptContent: `这是我读到的一条推文:\n `,
    promptAction:
      "已知所有推文内容都是符合事实的。解释这条推文要表达的意思。必要时请加入背景信息介绍。",
    promptReply: "回复如下："
  },
  {
    language: "Spanish",
    promptContent: `Este es un tweet que leí: \n `,
    promptReply: "La respuesta de otra persona es la siguiente:",
    promptAction:
      "Explique lo que este tweet trata de transmitir. Si es necesario, incluya información de contexto."
  },
  {
    language: "English",
    promptContent: `This is a tweet I read: \n `,
    promptReply: "Someone's reply is as follows:",
    promptAction:
      "Explain what this tweet is trying to convey. Please include any necessary background information."
  },
  {
    language: "Arabic",
    promptContent: `هذه هي تغريدة قرأتها: \n `,
    promptReply: "رد شخص ما كالتالي:",
    promptAction:
      "شرح ما يحاول هذه التغريدة نقله. يرجى تضمين أي معلومات خلفية ضرورية."
  },
  {
    language: "Hindi",
    promptContent: `यह मैंने पढ़ा एक ट्वीट है: \n `,
    promptReply: "अन्य व्यक्ति का जवाब निम्नलिखित है:",
    promptAction:
      "बताएं कि यह ट्वीट क्या अभिव्यक्त करने की कोशिश कर रहा है। आवश्यकता पड़ने पर कोई पृष्ठभूमि जानकारी शामिल करें।"
  },
  {
    language: "Bengali",
    promptContent: `এটি একটি টুইট যা আমি পড়েছি: \n `,
    promptReply: "অন্যান্য ব্যক্তির উত্তর এমনভাবে:",
    promptAction:
      "এই টুইট যা চেষ্টা করছে তা কী ব্যক্ত করতে চাচ্ছে তা ব্যাখ্যা করুন। প্রয়োজন হলে পশ্চাতে তথ্য সংযোজন করুন।"
  },
  {
    language: "Portuguese",
    promptContent: `Este é um tweet que li: \n `,
    promptReply: "A resposta de outra pessoa é a seguinte:",
    promptAction:
      "Explique o que este tweet está tentando transmitir. Por favor, inclua qualquer informação de contexto necessária."
  },
  {
    language: "Russian",
    promptContent: `Это твит, который я прочитал: \n `,
    promptReply: "Ответ другого человека следующий:",
    promptAction:
      "Объясните, что этот твит пытается передать. Пожалуйста, включите необходимую контекстуальную информацию."
  },
  {
    language: "Japanese",
    promptContent: `これは私が読んだツイートです：\n `,
    promptReply: "他の人の回答は次のとおりです：",
    promptAction:
      "このツイートが何を伝えようとしているのか説明してください。必要に応じて、背景情報を含めてください。"
  },
  {
    language: "Punjabi",
    promptContent: `ਇਹ ਮੈਂਨੂੰ ਪੜਿਆ ਇੱਕ ਟਵੀਟ ਹੈ: \n `,
    promptReply: "ਕਿਸੇ ਹੋਰ ਵਿਅਕਤੀ ਦਾ ਜਵਾਬ ਹੇਠਾਂ ਦਿੱਤਾ ਗਿਆ ਹੈ:",
    promptAction:
      "ਇਹ ਟਵੀਟ ਕੀ ਕੋਸ਼ਿਸ਼ ਕਰ ਰਿਹਾ ਹੈ ਇਸ ਦੀ ਵਿਆਖਿਆ ਕਰੋ। ਜੇ ਜ਼ਰੂਰੀ ਹੈ, ਸੰਦਰਭ ਜਾਣਕਾਰੀ ਵੀ ਸ਼ਾਮਲ ਕਰੋ।"
  },
  {
    language: "German",
    promptContent: `Dies ist ein Tweet, den ich gelesen habe: \n `,
    promptReply: "Die Antwort von jemandem lautet:",
    promptAction:
      "Erklären Sie, was dieser Tweet ausdrücken will. Bitte fügen Sie bei Bedarf Hintergrundinformationen hinzu."
  },
  {
    language: "Korean",
    promptContent: `이것은 내가 읽은 트윗입니다:\n `,
    promptReply: "다른 사람의 대답은 다음과 같습니다.",
    promptAction:
      "이 트윗이 무엇을 전하려고 하는지 설명하십시오. 필요한 경우 배경 정보를 포함하십시오."
  },
  {
    language: "French",
    promptContent: `Ceci est un tweet que j'ai lu : \n `,
    promptReply: "La réponse de quelqu'un est la suivante:",
    promptAction:
      "Expliquez ce que ce tweet essaie de transmettre. Veuillez inclure toute information de contexte nécessaire."
  },
  {
    language: "Vietnamese",
    promptContent: `Đây là tweet mà tôi đã đọc: \n `,
    promptReply: "Câu trả lời của một người khác như sau:",
    promptAction:
      "Hãy giải thích ý nghĩa của tweet này. Nếu cần, hãy bổ sung thông tin về bối cảnh."
  }
]

export interface Tweet {
  tweet: string
  id: string
  userName: string
  noConfig: boolean
  outDated: boolean
}
