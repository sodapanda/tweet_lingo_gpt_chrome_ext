import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  res.send(req.body.tweetContent)
}

export default handler
