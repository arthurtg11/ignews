import { fauna } from "../../../services/fauna"
import { query as q } from 'faunadb'
import { stripe } from "../../../services/stripe"

export async function saveSubscriptions(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {

    //Busca o Ref do usuario atravez do customerID
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )
    //Busca os dados da subscription atraves do subscriptionID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,

    }

    if (createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )

    } else {
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                {data: subscriptionData}
            )
        )
    }



}


