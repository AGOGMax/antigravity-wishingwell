import { Text } from "nes-ui-react";

interface YourTicketsProps {
  userAllTickets: (number[] | boolean[])[];
}

export default function YourTicketsContainer({
  userAllTickets,
}: YourTicketsProps) {
  return (
    <div className="w-min border-4 border-[#FDC62C] rounded-[10px] bg-[#004750] p-8">
      <Text size="medium" className="!text-center">
        YOUR TICKETS
      </Text>
      <div className="flex flex-col items-center justify-start">
        {userAllTickets?.length === 0 ? (
          <span className="!text-[16px] !text-pretty">
            {`Hit 'Enter Game' to buy Tickets!`}
          </span>
        ) : (
          (userAllTickets as [number[], boolean[]])?.[0]?.map(
            (ticket, index) => {
              return (
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
              );
            },
          )
        )}
      </div>
    </div>
  );
}
