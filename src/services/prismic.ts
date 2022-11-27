import Primic from '@prismicio/client'

export function getPrismicClient(req?: unknown){
    const prismic = Primic.client(
        process.env.PRISMIC_ENDPOINT,
        {
            req: req,
            accessToken: process.env.PRSIMIC_ACCESS_TOKEN,
        }
    )

    return prismic
}