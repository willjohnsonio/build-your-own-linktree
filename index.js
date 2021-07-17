import { Router } from "itty-router"

const links = [
  {
    "name": "Twitter",
    "url": "https://twitter.com/willjohnsonio",
    "svg": '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Twitter</title><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>'
  },
  {
    "name": "LinkedIn",
    "url": "https://www.linkedin.com/in/willjohnsonio/",
    "svg": '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
  },
  {
    "name": "Twitch",
    "url": "https://www.twitch.tv/willjohnsonio",
    "svg": '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Twitch</title><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>'
  }
]

class AvatarRewriter {
  element(element) {
      element.setAttribute("src", "https://avatars.githubusercontent.com/u/40403549?v=4")
  }
}

class LinkRewriter {
  element(element) {
      links.forEach(link => {
          element.append(
              `<a href="${link.url}" target="_blank">${link.name}</a>`,
              {
                  html: true,
              }
              
          )
      },
      )
  }
}

class NameRewriter {
  element(element) {
      element.setInnerContent("Will Johnson")
  }
}

class ProfileRewriter {
  element(element) {
      element.removeAttribute("style")
  }
}

class TitleRewriter {
  element(element) {
      element.setInnerContent("Will")
  }
}

class BodyRewriter {
  element(element) {
    element.setAttribute("class", "bg-purple-900")
  }
}

class SocialRewriter {
  element(element) {
      element.removeAttribute("style")

        links.forEach(link => {
            element.append(
                `<a href="${link.url}" target="_blank">${link.svg}</a>`,
                {
                    html: true,
                },
            )
        })
    }
  }



const router = Router()

router.get("/links", () => {
  const response = new Response(JSON.stringify(links), {
    headers: { 'content-type': 'application/json' },
  })

  return response
})



router.get("*", async () => {
  const html = await fetch(
      "https://static-links-page.signalnerve.workers.dev",
  )
      const response = new HTMLRewriter()
      .on("title", new TitleRewriter())
      .on("#profile", new ProfileRewriter())
      .on("#avatar", new AvatarRewriter())
      .on("#name", new NameRewriter())
      .on("#links", new LinkRewriter())
      .on("body", new BodyRewriter())
      .on("#social", new SocialRewriter())
      .transform(html)

  return response
})



addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})



