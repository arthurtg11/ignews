import Head from 'next/head';
import { GetStaticProps } from 'next'
import { SubscribeButton } from '../components/SubscribeButton';

import styles from './home.module.scss'
import { stripe } from '../services/stripe';

interface HomeProps{
  product: {
    priceId: string,
    amount: number
  }
}

export default function Home({ product } : HomeProps) {
  return (
    <>
      <Head>
        <title>Home - ig.news</title>
      </Head>
      <main className={styles.contentContainer}>

        <p>dsadas</p>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const price = await stripe.prices.retrieve('price_1JK9y7FsZtWo2dSW8lofOKhJ')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  }

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, //24 horas
  }

}
