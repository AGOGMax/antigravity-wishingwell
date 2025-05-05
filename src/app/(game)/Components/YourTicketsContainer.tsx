import { Text } from "nes-ui-react";

interface YourTicketsProps {
  userAllTickets: (number[] | boolean[])[];
  altText: string;
}

export default function YourTicketsContainer({
  userAllTickets,
  altText,
}: YourTicketsProps) {
  return (
    <div className="w-full lg:w-min border-4 border-[#FDC62C] rounded-[10px] bg-[#004750] p-8">
      <Text size="medium" className="!text-center">
        YOUR TICKETS
      </Text>
      <div
        className={`flex flex-row overflow-x-auto space-x-4 items-center max-w-[80vw] lg:flex-col lg:space-x-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          userAllTickets?.[0]?.length === 0 ? "justify-center" : ""
        }`}
      >
        {userAllTickets?.[0]?.length === 0 ? (
          <span className="!text-[16px] !text-pretty !text-center">
            {altText}
          </span>
        ) : (
          (userAllTickets as [number[], boolean[]])?.[0]?.map(
            (ticket, index) => (
              <span
                key={index}
                className={`${
                  (userAllTickets as [number[], boolean[]])?.[1]?.[index]
                    ? "text-successgreen"
                    : "text-brred"
                } !text-[16px] mb-[5px]`}
              >
                {Number(ticket) + 1}
              </span>
            ),
          )
        )}
      </div>
    </div>
  );
}
