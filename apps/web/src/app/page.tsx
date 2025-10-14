import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full min-h-screen">
      <img
        alt="MiniPay logo"
        src="/logo.svg"
        className="absolute left-6 top-6 size-20"
      />
      <div className="rounded-full bg-[#FFFFFF] fixed opacity-15 h-[45vh] left-[35vw] top-[-30vh] w-[45vh]"></div>
      <div className="rounded-full bg-[#FFFFFF] fixed opacity-15 h-[26vh] left-[-13vh] p-[3vh] top-[55vh] w-[26vh]">
        <div className="rounded-full h-[20vh] bg-[#696969] w-[20vh]"></div>
      </div>
      <div className="h-full flex max-w-md mx-auto">
        <div className="my-auto py-36">
          <div data-astro-cid-ynb3kdsf="" id="envelope-container" className="scale-125">
            <img
              alt="envelope background"
              src="/background.svg"
              data-astro-cid-ynb3kdsf=""
              className="center w-4/5"
            />{" "}
            <img
              alt="spark 1"
              src="/star.svg"
              data-astro-cid-ynb3kdsf=""
              className="center hide-on-ios spark"
              id="spark-1"
            />
            <img
              alt="spark 2"
              src="/star.svg"
              data-astro-cid-ynb3kdsf=""
              className="center hide-on-ios spark"
              id="spark-2"
            />
            <div className="relative" data-astro-cid-ynb3kdsf="">
              <div
                className="hide-on-ios wing-container"
                id="wing-left"
                data-astro-cid-ynb3kdsf=""
              >
                <img
                  alt="left wing"
                  src="https://link.minipay.xyz/_astro/wing_left.C87b8Dj0.svg"
                  data-astro-cid-ynb3kdsf=""
                />
              </div>
              <img
                alt="envelope back"
                src="https://link.minipay.xyz/_astro/envelope_back.BPjn71Z6.svg"
                data-astro-cid-ynb3kdsf=""
                className="center envelope"
              />{" "}
              <img
                alt="dollar bill"
                src="dollar_bill.svg"
                data-astro-cid-ynb3kdsf=""
                className="center"
                id="dollar-bill"
              />
              <div
                className="hide-on-ios wing-container"
                id="wing-right"
                data-astro-cid-ynb3kdsf=""
              >
                <img
                  alt="right wing"
                  src="https://link.minipay.xyz/_astro/wing_right.BRJZg5Pn.svg"
                  data-astro-cid-ynb3kdsf=""
                />
              </div>
              <img
                alt="envelope front"
                src="https://link.minipay.xyz/_astro/envelope_front.DBnwaVco.svg"
                data-astro-cid-ynb3kdsf=""
                className="center envelope"
              />
            </div>
          </div>
          <div className="px-6" data-astro-cid-mseuu5kk="">
            <h1
              className="text-center font-medium text-headline-lg"
              data-astro-cid-mseuu5kk=""
            >
              You&apos;ve got cash!
            </h1>
            <p
              className="text-body-lg mt-[1.5vh] text-center"
              data-astro-cid-mseuu5kk=""
            >
              This is a Cash Link from{" "}
              <span className="font-bold" data-astro-cid-mseuu5kk="">
                Mezo Lite
              </span>
              . Install the app to claim the money.
            </p>
            <div
              className="relative duration-[800ms] mt-8 transition-[height] h-[200px]"
              data-astro-cid-mseuu5kk=""
              id="action-container"
            >
              <button
                className="rounded-full bg-black text-label-lg text-white absolute duration-[400ms] h-[60px] transition-opacity w-full opacity-0"
                data-astro-cid-mseuu5kk=""
                id="expand-more-button"
              >
                Claim money{" "}
                <svg
                  className="inline-block ml-1"
                  fill="none"
                  height="28"
                  viewBox="0 0 28 28"
                  width="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.0001 17.4417C13.8445 17.4417 13.6987 17.4174 13.5626 17.3688C13.4265 17.3201 13.3001 17.2375 13.1834 17.1208L7.7876 11.725C7.57371 11.5111 7.47162 11.2438 7.48135 10.9229C7.49107 10.6021 7.60287 10.3347 7.81676 10.1208C8.03065 9.90695 8.30287 9.80001 8.63343 9.80001C8.96399 9.80001 9.23621 9.90695 9.4501 10.1208L14.0001 14.6708L18.5793 10.0917C18.7932 9.87779 19.0605 9.7757 19.3813 9.78542C19.7022 9.79515 19.9695 9.90695 20.1834 10.1208C20.3973 10.3347 20.5043 10.607 20.5043 10.9375C20.5043 11.2681 20.3973 11.5403 20.1834 11.7542L14.8168 17.1208C14.7001 17.2375 14.5737 17.3201 14.4376 17.3688C14.3015 17.4174 14.1557 17.4417 14.0001 17.4417Z"
                    fill="white"
                  ></path>
                </svg>
              </button>
              <div
                className="absolute duration-[400ms] transition-opacity"
                data-astro-cid-mseuu5kk=""
                id="steps-container"
              >
                <div className="flex gap-5" data-astro-cid-mseuu5kk="">
                  <div data-astro-cid-mseuu5kk="">
                    <div className="cash-link-step" data-astro-cid-mseuu5kk="">
                      1
                    </div>
                    <div
                      className="border-black border-dashed border-r-2 h-[76px] w-1/2 ml-0.5"
                      data-astro-cid-mseuu5kk=""
                    ></div>
                    <div className="cash-link-step" data-astro-cid-mseuu5kk="">
                      2
                    </div>
                  </div>
                  <div className="py-1" data-astro-cid-mseuu5kk="">
                    <p className="text-body-lg mb-2" data-astro-cid-mseuu5kk="">
                      Download the Mezo Lite app.
                    </p>
                    <div
                      className="flex-col gap-2 flex"
                      data-astro-cid-mseuu5kk=""
                      id="install-anchors"
                    >
                      <a
                        className="z-10 [@media(max-height:525px)]:pb-20 h-[55px] w-[186px]"
                        href="https://apps.apple.com/us/app/minipay-easy-global-wallet/id6504087257"
                        id="mini-pay-install-anchor-ios"
                        target="_blank"
                      >
                        <img
                          alt="App Store"
                          src="https://link.minipay.xyz/_astro/app_store_badge.D1Rwqx6j.svg"
                          height="55"
                          width="186"
                        />
                      </a>
                    </div>
                    <p className="text-body-lg mt-7" data-astro-cid-mseuu5kk="">
                      Now you can claim the cash.
                    </p>
                    <a
                      className="rounded-full bg-black text-label-lg text-white h-11 items-center justify-center mt-2 w-[216px] flex"
                      href="https://cash.minipay.xyz/?medium=landing_page&amp;source=cashlink#7qXAV7igmUjcaSOns-7WKw"
                      id="cashlink-anchor"
                      target="_blank"
                      data-astro-cid-mseuu5kk=""
                    >
                      Open the app
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
