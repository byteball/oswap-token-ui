import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { selectSettings } from "store/slices/agentSlice";

export default () => {
  const settings = useSelector(selectSettings);
  const emission = (settings.inflation_rate * 100) || 0;
  const baseAppreciationRate = (settings.base_rate * 100) || 0;

  const faqs = [
    {
      question: "What's the purpose of OSWAP token?",
      answer: <>
        <p>OSWAP token is designed to reflect the success of Oswap protocol — with greater total value locked (TVL) in all pools of <a href="https://oswap.io" target="_blank" rel="noopener" className="text-primary">Oswap DEX</a> the token appreciates faster, and with lower TVL it appreciates slower.</p>
        <p>OSWAP token is also used to incentivize some Oswap pools by rewarding the liquidity providers (LPs) in those pools with emissions of OSWAP token. Which pools to incentivize and in what proportions is decided by <Link className="text-primary" to="/governance">governance</Link> of OSWAP token holders who lock their tokens for up to 4 years and are also rewarded with OSWAP token emissions.</p>
      </>,
    },
    {
      question: "How does appreciation work? The price can't increase just out of nowhere, right?",
      answer: <>
        <p>You are right, the price can't change just out of nowhere, and something has to be given up in exchange for an increase in price.</p>
        <p>To explain the appreciation mechanism mathematically, the token is issued on a bonding curve, which is a formula that links the amount of OSWAP tokens issued and the amount of the reserve currency (GBYTE) sent to issuing them (see the next question for details). The formula also determines the price of OSWAP tokens which changes depending on the amount of tokens already issued — grows with the growing supply of OSWAP tokens. The curve has several parameters that determine its shape. To change the price without buying or selling any tokens, the parameters of the curve need to be changed. With the new parameters, we start using another bonding curve, with slightly different shape that yields a higher price at the current supply of OSWAP tokens, however the price would fall faster if the supply were to decrease.</p>
        <div className="justify-between max-w-full sm:space-x-4 sm:flex">
          <img className="sm:max-w-[50%] m-0 p-2" src="/bonding-curve-appreciation-reserve.svg" alt="" />
          <img className="sm:max-w-[50%] m-0 p-2" src="/bonding-curve-appreciation-price.svg" alt="" />
        </div>
        <p>This means that the token's appreciation comes at the expense of a lower price for those who redeem last. However, there are also incentives for long-term locking of tokens, which make the possibility of large redemptions more remote. Also, fees collected from trading the OSWAP token change the shape of the bonding curve in such a way that late-redeemers get a better price.</p>
      </>,
    },
    {
      question: "How are the tokens priced?",
      answer: <>
        <p>OSWAP tokens are issued on a bonding curve — a mathematical formula that binds the supply of the tokens to the amount of the reserve currency (GBYTE) invested in issuing them. The formula looks like:</p>
        <span className="inline-flex items-center text-xl leading-tight">
          <span>
            <i>r</i>&nbsp; = &nbsp;
            <i>c </i> &nbsp;
          </span>
          <span className="flex flex-col items-center justify-center">
            <span>
              <i>s</i><sub><small>0</small></sub>  <i>s</i>
            </span>
            <span className="mt-1 border-t border-primary-gray-light">
              <span className="whitespace-nowrap">
                <i>s</i><sub><small>0</small></sub> - <i>s</i>
              </span>
            </span>
          </span>
        </span>
        <p>where</p>
        <ul className="marker:text-primary-gray-light">
          <li><i>r</i> is the GBYTE reserve committed to issuing OSWAP tokens;</li>
          <li><i>s</i> is the supply of OSWAP tokens;</li>
          <li><i>s</i><sub>0</sub> is the maximum supply of OSWAP tokens;</li>
          <li><i>c</i> is a coefficient that starts with 1 and changes due to accruing fees, appreciation, and emissions.</li>
        </ul>
        <p>The price of OSWAP token is the derivative of <i>r</i> with respect to <i>s</i>:</p>
        <p>
          <span className="inline-flex items-center text-xl leading-tight">
            <span>
              <i>p</i>&nbsp; = &nbsp;
              <i>c </i> &nbsp;
            </span>
            <span className="flex flex-col items-center justify-center">
              <span>
                <i>s</i><sub><small>0</small></sub><sup><small>2</small></sup>
              </span>
              <span className="mt-1 border-t border-primary-gray-light">
                <span className="whitespace-nowrap">
                  (<i>s</i><sub><small>0</small></sub> - <i>s</i>)<sup><small>2</small></sup>
                </span>
              </span>
            </span>
          </span>
        </p>
        <p>It's clear from the above formulas that the price grows with the growing supply, and as the supply <i>s</i> approaches <i>s</i><sub>0</sub>, both the reserve and the price go to infinity.</p>
        <div className="justify-between max-w-full sm:space-x-4 sm:flex">
          <img className="sm:max-w-[50%] m-0 p-2" src="/reserve.svg" alt="" />
          <img className="sm:max-w-[50%] m-0 p-2" src="/price.svg" alt="" />
        </div>
        <p>This means that early investors get a lower price and every additional purchase further increases the price, while selling the token back to the curve decreases its price.</p>
        <p>There are fees charged for every purchase or sale of OSWAP tokens, the fee is added back to the reserve and benefits the holders of OSWAP tokens.</p>
        <p>The bonding curve is implemented by an <a href="https://obyte.org/platform/autonomous-agents" target="_blank" rel="noopener" className="text-primary">Autonomous Agent</a>, and the AA acts like a decentralized market maker that automatically adjusts its prices in response to the changing demand. OSWAP holders act like shareholders of the decentralized market maker, and share its profits from trading fees.</p>
      </>,
    },
    {
      question: "What are the fees?",
      answer: <>
        <p>The current trading fee for buying/selling OSWAP tokens is 0.3% but it can be changed by <Link className="text-primary" to="/governance/params">governance</Link>.</p>
        <p>Also, there is an <i>arbitrageur profit tax</i>, which is an additional fee calculated based on implied arbitrageur profit when arbitraging this market against any external market where OSWAP token is also traded. This tax is currently set to 90% of estimated arbitrageur profit. It also can be changed by <Link className="text-primary" to="/governance/params">governance</Link>.</p>
        <p>Both fees are added to the reserve and benefit the existing OSWAP token holders. Note that simply adding the earned fee to the reserve would break its bond with the supply (which didn't change) according to the bonding curve, so when adding the fee the AA also changes the <i>c</i> and <i>s</i><sub>0</sub> parameters to keep the supply and the price unchanged.</p>
      </>,
    },
    {
      question: "What ensures the liquidity of OSWAP token?",
      answer: <>
        <p>The bonding curve. Thanks to the bonding curve, it is always possible to buy and sell OSWAP tokens. On the front page, you can see the amount of GBYTE that backs the token's liquidity. This is what we call <i>internal</i> liquidity.</p>
        <p>However, the full liquidity backing OSWAP tokens is actually larger. Firstly, there might be other markets where OSWAP tokens are traded. Secondly, if the tokens are sold to the bonding curve and the price goes down, more buyers might appear who would be happy to buy at a lower price. A bonding curve is similar to a depth chart on an exchange, and like a depth chart, it doesn't show all the buyers (however, unlike a depth chart, the liquidity cannot be removed from a bonding curve). The same is true about sell liquidity when the tokens are bought. This is what we call <i>external</i> liquidity.</p>
        <p>Immediately after launch, internal liquidity is all the liquidity that OSWAP token has. Over time, we expect the external liquidity to gradually grow in significance.</p>
      </>,
    },
    {
      question: "How is TVL tracked?",
      answer: <>
        <p>There is an <a href="https://obyte.io/@KMCA3VLWKLO3AWSSDA3LQIKI3OQEN7TV" className="text-primary" target="_blank" rel="noopener">oracle</a> that posts the combined TVL of all Oswap pools from time to time. The TVL is measured in USD. If a new version of Oswap is released, or there is a fork by independent developers, the TVL of their pools will be included in the combined TVL (as long as their main business is still a DEX).</p>
        <p>The oracle can be updated by <Link className="text-primary" to="/governance/params">governance</Link>. Currently, the oracle is centralized and there are risks of oracle malfunction (malicious or accidental). However small deviations of the posted TVL from the actual one don't pose a big risk to the ecosystem as they affect only the <i>rate</i> of appreciation for a short time until the oracle issue is resolved (by the oracle operator, or by governance — by appointing a new oracle).</p>
      </>,
    },
    {
      question: "How fast does OSWAP token appreciate?",
      answer: <>
        <p>You can see the current appreciation rate on the front page. It depends on the current TVL of all Oswap pools combined, target TVL, and the target appreciation rate. The latter two are regulated by <Link className="text-primary" to="/governance/params">governance</Link>, currently they are set to {baseAppreciationRate}% p.a. appreciation at $1m TVL. When the current TVL is different from the target TVL, the actual appreciation rate is scaled accordingly, so for example at $2m TVL it would be 60% per year.</p>
      </>,
    },
    {
      question: "How often is the appreciation applied? Daily, monthly?",
      answer: <p>Continuously. It's applied before every trade based on the time elapsed since the previous trade. This ensures that the price changes in very small increments and there are no abrupt changes (that traders would try to take advantage of).</p>,
    },
    {
      question: "How large is the emission rate?",
      answer: <p>Currently, it is {emission}% p.a. That means that the supply of OSWAP tokens increases {emission}% per year (not including the supply changes due to trading) and the newly issued tokens are used to incentivize liquidity provision in Oswap pools and incentivize locking OSWAP tokens in governance. The emission rate can be changed by <Link className="text-primary" to="/governance/params">governance</Link>. The distribution of newly minted tokens between LPs and OSWAP stakers is currently 50/50 but it can also be changed by <Link className="text-primary" to="/governance/params">governance</Link>.</p>,
    },
    {
      question: "How often are new tokens emitted? Daily, monthly?",
      answer: <p>Continuously. Emission is applied before every trade based on the time elapsed since the previous trade.</p>,
    },
    {
      question: "How do emissions affect the bonding curve?",
      answer: <>
        <p>They don't change the current price, however the bonding curve's parameters <i>c</i> and <i>s</i><sub>0</sub> are updated to match the new supply without changing the reserve and the price.</p>
        <p>With the updated parameters, the price curve changes in such a way that the price would fall faster when the tokens are redeemed (sold back to the bonding curve), i.e. the late-redeemers would get a lower price. This effect is set off (partially or fully) by the accumulation of trading fees, which has the opposite effect, i.e. improves the conditions for the late-redeemers. Also, incentives are in place for long-term locking of OSWAP tokens, which makes the possibility of large redemptions more remote.</p>
      </>,
    },
    {
      question: "How to prevent dilution due to emissions of OSWAP token?",
      answer: <>
        <p><Link className="text-primary" to="/governance/shares/stake">Stake (lock) your OSWAP tokens</Link> in governance and you'll be among those who receive the emissions.</p>
        <p>Participation in governance also allows you to influence how the emissions are distributed among <a className="text-primary" href="https://oswap.io" target="_blank" rel="noopener">Oswap</a> pools and direct more emissions to those pools where you provide liquidity, or pools with the tokens that you hold.</p>
      </>,
    },
    {
      question: "How large are the staking rewards for staking OSWAP tokens?",
      answer: <>
        <p>Currently, total yearly emissions are {emission}% of the total supply, and 50% of emissions go to stakers. However, it doesn't mean that the APY is {emission / 2}%. It actually depends on the share of OSWAP tokens that is being staked as emissions are distributed only among stakers while non-stakers are not eligible for emissions. Your APY also depends on your locking period — the farther away your unlock date is, the greater share of emissions you receive (it is proportional to your voting power). You can see your current staking APY on the <Link className="text-primary" to="/governance/dashboard">governance dashboard</Link>.</p>
      </>,
    },
    {
      question: "What are the minimum and maximum locking periods of OSWAP tokens?",
      answer: <>
        <p>14 days and 4 years. A longer locking period gives you more voting power and a larger share of OSWAP token emissions.</p>
      </>,
    },
    {
      question: "What is voting power?",
      answer: <>
        <p>Voting power (VP) determines the weight of your votes when voting on governance decisions. It also determines the share of stakers emissions you receive — it is equal to the ratio of your VP to the total VP of all stakers combined.</p>
        <p>VP depends on the amount of OSWAP tokens you locked and the time left until unlocking, with longer locking periods yielding greater VP. If you lock the tokens for the maximum period — 4 years — you get the maximum possible VP which is equal to your locked balance. After you lock the tokens, your VP starts decaying exponentially so that it decays 2 times every half a year, or 4 times a year. After 4 years, it would decay 256 times. If you lock for less than 4 years, your initial VP is chosen such that at the end of your locking period it would be equal to 1/256th of your locked balance.</p>
        <img className="sm:max-w-[70%] my-[-8%] mx-auto" src="/voting-power.svg" alt="" />
        <p>To regain your voting power (and the share in staking rewards) you can just periodically re-stake your accrued staking rewards and extend your locking period to 4 years in the future. This restores your VP to its maximum and also compounds your rewards.</p>
      </>,
    },
    {
      question: "I'm new to Obyte, do I need to buy GBYTE first in order to buy OSWAP token?",
      answer: <>
        <p>You can but it's not necessary. You can also buy OSWAP token using USDC, ETH, or WBTC. However you do need an <a href="https://obyte.org/#download" className="text-primary" target="_blank" rel="noopener">Obyte</a> wallet in order to receive your OSWAP tokens.</p>
        <p>If you buy using Ethereum tokens, your input tokens will be automatically bridged to Obyte through <a href="https://counterstake.org" className="text-primary" target="_blank" rel="noopener">Counterstake Bridge</a>, then swapped to GBYTE via <a href="https://oswap.io" className="text-primary" target="_blank" rel="noopener">Oswap</a> and the GBYTE sent to buy OSWAP tokens.</p>
      </>,
    },
    {
      question: "How are the LP rewards distributed among pools?",
      answer: <>
        <p><Link className="text-primary" to="/governance/shares/stake">Governance</Link> decides that. Every OSWAP staker indicates their preference about the percentages that each pool should receive. For example, one staker might say that they want 50% to go to pool1 and 50% to pool2, while another staker wants 20% to pool2, 45% to pool3, and 35% to pool4. The votes of stakers are weighed using their VP and averaged to get the final percentages that each pool receives. Governance participants can move their votes at any time and the distribution percentages can change as a result.</p>
      </>,
    },
    {
      question: "What pools can receive LP rewards?",
      answer: <>
        <p>Every <a href="https://oswap.io" className="text-primary" target="_blank" rel="noopener">Oswap</a> pool can be incentivized with OSWAP token rewards, however it should first be <Link className="text-primary" to="/governance/whitelist">added to the whitelist by a governance decision</Link>.</p>
        <p>Any staker can offer any pool to be added and other stakers can vote for or against whitelisting. If the absolute majority of the voting power supports whitelisting, or if there are more supporters than the opponents (while the rest didn't vote) for 5 consecutive days, then the new pool is whitelisted and can start receiving votes for rewards redistribution.</p>
        <p>This means that it should be easy to add a new pool by offering it even with a minimum VP and waiting for 5 days, unless it meets strong opposition among other voters.</p>
      </>,
    },
    {
      question: "I provide liquidity in one of Oswap pools, can I earn more?",
      answer: <>
        <p>Yes, that's what this website is for!</p>
        <p>If your pool is already listed on the <Link className="text-primary" to="/farming">farming page</Link>, you can see the additional APY you would earn by depositing your pool tokens. Deposit the tokens, and you can harvest the rewards in OSWAP tokens as often as you like. To stop receiving rewards, you can withdraw the LP tokens at any time.</p>
        <p>If your pool is not listed, you can add it. See the next question.</p>
      </>,
    },
    {
      question: "How can I add a new pool to farming?",
      answer: <>
        <p>If your pool is not listed on the <Link className="text-primary" to="/farming">farming page</Link> but you want the LPs to earn additional income by receiving a share of OSWAP token emissions, you can add the pool by following these steps:</p>
        <ol>
          <li><Link className="text-primary" to="/">Buy OSWAP tokens</Link> if you don't already have them.</li>
          <li><Link className="text-primary" to="/governance/shares/stake">Stake them in governance</Link> for a period from 14 days to 4 years.</li>
          <li><Link className="text-primary" to="/governance/whitelist">Add your pool to the whitelist</Link>. Your offer to add a new pool to the whitelist has to be voted by governance participants (including you). If there are no votes against your offer for 5 days, you can commit the addition on the same page. Now your pool is whitelisted and can receive a share of OSWAP token emissions.</li>
          <li><Link className="text-primary" to="/governance/shares/move">Move your votes</Link> in favor of the newly added pool. Now it will start receiving emissions as soon as the first pool tokens get deposited on the <Link className="text-primary" to="/farming">farming page</Link>.</li>
          <li>Deposit your LP tokens on the <Link className="text-primary" to="/farming">farming page</Link>. If you are the only farmer of this pool so far, you get 100% of emissions directed to this pool.</li>
        </ol>
        <p>To increase the emissions directed to your pool, convince others to join governance and allocate a bigger share of their votes to your pool.</p>
      </>,
    },
    {
      question: "Do Oswap pools have to pay anything to OSWAP token holders or stakers?",
      answer: <>
        <p>No, there is no tax on the pools (unlike other popular DEXes such as Sushi, Curve, PanCakeSwap, QuickSwap, etc), 100% of the collected fees belong to LPs.</p>
        <p>However, pools can be programmed to spend a share of the collected fees to buy OSWAP tokens and burn them, thus paying back to OSWAP holders (buying increases the current price and burning raises the price received when redeeming). This is completely voluntary. The current version of <a className="text-primary" href="https://github.com/byteball/oswap-v2-aa" target="_blank" rel="noopener">Oswap AAs</a> doesn't offer such an option, however the AAs are open source and can be forked to include it.</p>
      </>,
    },
    {
      question: "How often are LP rewards paid?",
      answer: <>
        <p>Continuously. The rewards just accrue over time and you can claim them as often as you like.</p>
      </>,
    },
    {
      question: "When can I get my LP tokens back?",
      answer: <>
        <p>Any time you want. They are not time-locked (unlike OSWAP tokens in governance). Once you withdraw your LP tokens, you stop receiving rewards.</p>
      </>,
    },
    {
      question: "How will the initial sale of OSWAP tokens be organized?",
      answer: <>
        <p>OSWAP token will launch on April 6, 2023 at 04:34 UTC. Before the launch, every potential buyer can deposit their GBYTEs for buying the future OSWAP tokens. On the launch date, all the deposited GBYTEs will be sent to the bonding curve to buy OSWAP tokens, and the bought tokens will be distributed among buyers in proportion to their contributions. They will need to claim the tokens.</p>
        <p>If a buyer changes their mind before the launch, they can withdraw their GBYTEs. New deposits from buyers are accepted up to 1 day before the launch.</p>
        <p>If required, Obyte team can extend the initial sale period, but it cannot shorten it. That's the only privilege that Obyte team has. It becomes irrelevant after the launch.</p>
        <p>The initial price of OSWAP token on the bonding curve is 1 OSWAP = 1 GBYTE but after the initial purchase, the price will increase (according to the bonding curve). However, since all buyers are buying together in one transaction, they all will receive the same (average) price. This price will be higher than 1 GBYTE (the initial price) but lower than the final price on the bonding curve, which the subsequent buyers will pay.</p>
        <img className="sm:max-w-[70%] mx-auto" src="/initial-sale.svg" alt="" />
        <p>All OSWAP tokens bought in the initial sale will be locked for the maximum locking period — 4 years. Thus, immediately after the launch, there will be no freely circulating tokens for sale, and new tokens can be bought only from the bonding curve.</p>
        <p>To participate in the initial sale, one needs to have GBYTE or use ETH, USDC, or WBTC on Ethereum, and the tokens will be automatically bridged (via <a href="https://counterstake.org" className="text-primary" target="_blank" rel="noopener">Counterstake</a>) and converted to GBYTE (via <a className="text-primary" href="https://oswap.io" target="_blank" rel="noopener">Oswap</a>) before depositing them for the initial sale.</p>
      </>,
    },
    {
      question: "Why invest in OSWAP token?",
      answer: <>
        <p>There are several ways to benefit from investing in OSWAP token, directly or indirectly:</p>
        <ul className="marker:text-primary-gray-light">
          <li>Appreciation of OSWAP token. Its price on the bonding curve automatically increases and the rate of increase depends on how widely the <a className="text-primary" href="https://oswap.io" target="_blank" rel="noopener">Oswap</a> protocol is used — higher total TVL in all Oswap pools yields faster appreciation. See another question above to learn how the appreciation works and its trade-offs.</li>
          <li>Participation in governance. By buying OSWAP tokens and locking them in governance you get an opportunity to influence the distribution of OSWAP token emissions and direct more emissions to pools where you have interest, such as the pools where you provide liquidity or the pools that are an important piece of infrastructure for other projects you participate in. Your influence is determined by your voting power, which depends on the locked balance and the locking period (longer locking period — more VP)</li>
          <li>Getting a share of OSWAP token emissions. By buying OSWAP tokens and locking them in governance you get a share of new OSWAP token emissions, which is currently {emission}% per year and 50% of the emission goes to governance participants (both percentages can be changed by governance). Your share in the emissions is proportional to your VP.</li>
        </ul>
      </>,
    },
  ];

  return (
    <div>
      <Helmet>
        <title>OSWAP token — F.A.Q.</title>
      </Helmet>
      <div className="px-4 py-16 mx-auto sm:px-6 lg:py-10 lg:px-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently asked questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Can’t find the answer you’re looking for? Ask on{" "}
              <a href="https://discord.obyte.org/" target="_blank" rel="noopener" className="font-medium text-primary hover:text-primary/75">
                Obyte discord
              </a>.
            </p>
          </div>
          <div className="mt-12 lg:col-span-2 lg:mt-0">
            <dl className="space-y-12">
              {faqs.map((faq) => (
                <div key={faq.question} className="p-8 bg-primary-gray rounded-xl">
                  <dt className="mb-5 text-xl font-bold text-white leading">{faq.question}</dt>
                  <dd className="text-base font-medium prose prose-xl text-primary-gray-light">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
