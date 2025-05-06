export default function BuiltForMerchants() {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for Local Merchants
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">
                  Tailored for businesses in Kampala and similar markets
                </p>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">
                  Accept payments from global customers using USDC
                </p>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">
                  No complex setup—just internet access and a smartphone
                </p>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">
                  Reduce reliance on mobile money or local banking systems
                </p>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">Merchant Dashboard</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Today
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Received</div>
                    <div className="text-green-500 font-semibold">
                      $1,450.00 USDC
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    Recent Transactions
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>Payment from 0x3f8...92e1</div>
                      <div className="font-medium">$25.00</div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>Payment from 0x72a...1f3b</div>
                      <div className="font-medium">$17.50</div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>Payment from 0x91c...43a2</div>
                      <div className="font-medium">$42.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
