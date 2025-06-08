"use client";

import { IMAGEKIT_ICONS, IMAGEKIT_IMAGES } from "@/assets/imageKit";
import Image from "next/image";
import H1 from "../HTML/H1";
import P from "../HTML/P";
import Button from "../Button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { client as cmsClient } from "../../../sanity/lib/client";
import moment from "moment";
import ThreeDHovercardEffect from "../ThreeDHovercardEffect";

export default function Event() {
  const [event, setEvent] = useState({
    name: "",
    description: [],
    date: "",
    register_url: "",
  });
  useEffect(() => {
    cmsClient
      .fetch(
        `*[_type=="collective"][0]{
		event
	  }`,
      )
      .then((collective) => {
        cmsClient
          .fetch(`*[_type=="event"&&_id=="${collective.event._ref}"][0]`)
          .then((event) => {
            setEvent({
              name: event.name,
              description: event.description,
              date: event.date,
              register_url: event.register_url,
            });
          });
      });
  }, []);
  const ImageLink = IMAGEKIT_IMAGES.COLLECTIVE_EVENT;

  if (!event.name || !event.register_url) return null;

  return (
    <div className="my-[50px] md:mt-[750px] md:mb-0 h-fit w-full flex justify-center items-center">
      <ThreeDHovercardEffect ROTATION_RANGE={5}>
        <div className="relative flex w-full sm:w-screen  max-w-[992px] h-[523px] z-0">
          <div className="flex flex-col md:flex-row justify-end md:justify-between items-start md:items-end gap-[8px] overflow-hidden h-full w-full md:rounded-[12px] bg-gradient-to-t from-[#000000BF] to-[#00000000] p-[16px]">
            <div className="flex flex-col gap-[8px]">
              <div className="overflow-hidden">
                <motion.div
                  whileInView={{ y: 0 }}
                  initial={{ y: "100%" }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    bounce: 0.25,
                  }}
                >
                  <H1>{event.name}</H1>
                </motion.div>
              </div>
              <div className="overflow-hidden">
                <motion.div
                  whileInView={{ y: 0 }}
                  initial={{ y: "100%" }}
                  transition={{
                    duration: 0.75,
                    type: "spring",
                    bounce: 0.25,
                  }}
                >
                  <div className="flex justify-center items-center gap-[8px] w-fit">
                    <motion.div
                      whileHover={{
                        animation: "wiggle 1s linear forwards",
                      }}
                    >
                      <Image
                        src={IMAGEKIT_ICONS.CALENDAR}
                        alt="Calendar Icon"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </motion.div>
                    <P>{moment(event.date).format("LL")}</P>
                  </div>
                </motion.div>
              </div>
              <div className="overflow-hidden ">
                {event.description.map((desc) => (
                  <motion.div
                    key={desc}
                    whileInView={{ y: 0 }}
                    initial={{ y: "100%" }}
                    transition={{
                      duration: 1,
                      type: "spring",
                      bounce: 0.25,
                    }}
                  >
                    <P>{desc}</P>
                  </motion.div>
                ))}
              </div>
            </div>
            <a
              href={event.register_url}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-fit h-fit"
            >
              <Button
                innerText="Register For Event"
                iconSrc={IMAGEKIT_ICONS.ROCKET}
                iconAlt="Rocket Icon"
                className="w-full md:w-fit"
                variants={{
                  hover: {
                    animationName: "rocketLaunch",
                    animationDuration: "0.5s",
                    animationFillMode: "forwards",
                    animationTimingFunction: "linear",
                  },
                  rest: {
                    animationName: "rocketLaunchRest",
                    animationDuration: "0.5s",
                    animationFillMode: "forwards",
                    animationTimingFunction: "linear",
                  },
                }}
              />
            </a>
            <Image
              src={ImageLink}
              alt="Collective Event"
              width={992}
              height={522.62}
              className="absolute inset-0 -z-[1] h-full object-none md:object-cover md:rounded-[12px]"
            />
          </div>

          <Image
            src={ImageLink}
            alt="Collective Event"
            width={992}
            height={522.62}
            className="absolute inset-0 -z-[2] scale-[1.15] object-cover blur-[50px]"
          />
        </div>
      </ThreeDHovercardEffect>
    </div>
  );
}
