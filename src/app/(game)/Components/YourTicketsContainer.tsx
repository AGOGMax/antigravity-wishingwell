import { Container, Text } from "nes-ui-react";

interface YourTicketsProps {
  userAllTickets: (number[] | boolean[])[];
}

export default function YourTicketsContainer({
  userAllTickets,
}: YourTicketsProps) {
  return (
    <div className="w-min">
      <Container
        align="center"
        title="Your Tickets"
        roundedCorners
        alignTitle="center"
        className="your-tickets-container"
        style={{ width: "fit-content" }}
      >
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
      </Container>
    </div>
  );
}
