import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import { stripe } from "../../services/stripe";
import { saveSubscriptions } from "./_lib/manageSubstription";

// Um condigo pronto da web, Simplemente recebe as requisições e transforma ela em um buffer,
// Como as requisições chegam uma de cada vez, ele espera até chegar todas para finalizar a função
async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks)
}

//Desativa o bodyParser, pois a requisição que o stripe manda, é no formato Steam
export const config = {
    api: {
        bodyParser: false,
    }
}

//Define quais tipos são importantes, os que não estiverem aqui dentro, não serão tratados
const relevantEvents = new Set([ //Set => é um array, porém os dados dentro dele não podem ser repetidos.
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method == 'POST') {
        const buf = await buffer(req)
        const secret = req.headers['stripe-signature'] //É A CHAVE QUE ESTÁ NO MEU ENV.LOCAL, O STIPE ENVIA PARA DIZER QUE É SEGURA A COMUNICAÇÃO
        
        //São os eventos que vem do WebHook
        let event: Stripe.Event;


        //Verifica se a key enviada no WebHook é igual a key armazenada no nosso Env.local
        //Realizado por questões de segurança.
        try {
            event = stripe.webhooks.constructEvent(buf, secret, 'whsec_8oFhK2jjTtyAxElaHAy10YwVv70uAbYK');
        } catch (err) {
            console.log(`Erro ${err.message}`)
            return res.status(400).send(`WebHook error: ${err.message}`)
        }

        //Retorna o tipo do evento Ex.: checkout.session.completed
        const { type } = event;


        //Se o evento for importante.
        if (relevantEvents.has(type)) {
            //console.log('Evento recebido', event)
            try {
                console.log(type)
                switch (type) {
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        await saveSubscriptions(
                            subscription.id,
                            subscription.customer.toString()
                        )

                        break;



                    case 'checkout.session.completed':

                    const checkoutSession = event.data.object as Stripe.Checkout.Session;

                    await saveSubscriptions(
                        checkoutSession.subscription.toString(),
                        checkoutSession.customer.toString(),
                        true
                    )

                        break;
                    default:
                        throw new Error('Unhandled event.')
                }
            } catch (err) {
                return res.json({error: 'WebHook hanndler failed'})
            }


        }

        res.json({ received: true })
    }
    else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}