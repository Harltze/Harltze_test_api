import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const currencyEnum = ["gbp", "usd", "eur", "ngn"];

const CMSSchema = new Schema(
  {
    // pictures: {
    //     type: Array,
    //     required: true
    // },
    hero: {
      type: [
        {
          pictureURL: {
            type: String,
          },
          header: {
            type: String,
          },
          description: {
            type: String,
          },
          linkButtonTitle: {
            type: String,
          },
          linkButtonUrl: {
            type: String,
          },
        },
      ],
    },
    affiliate: {
      content: String,
      link: String,
    },
    premiumBanner: {
      title: String,
      description: String,
      buttonTitle: String,
      buttonLink: String,
      pictureUrl: String,
    },
    galleryBanner: {
      title: String,
      description: String,
      buttonTitle: String,
      buttonLink: String,
      pictureUrl: String,
    },
    aboutUs: {
      aboutUs: {
        title: String,
        description: String,
      },
      aboutSection: {
        title: String,
        description: String,
        imageUrl: String,
      },
      ourJourney: {
        title: String,
        description: String,
      },
      whyWeExist: {
        title: String,
        description: String,
      },
      joinTheBuild: {
        title: String,
        description: String,
      },
      ourMissionAndValues: {
        type: [
          {
            value: String,
          },
        ],
      },
      whatOurCustomersSay: {
        type: [
          {
            value: String,
          },
        ],
      },
      meetOurTeam: {
        type: [
          {
            name: String,
            picture: String,
            role: String
          },
        ],
      },
    },
    contactUs: {
      phoneNumber: String,
      address: String,
      email: String,
    },
    termsAndConditions: {
      type: [
        {
          title: String,
          description: String,
        },
      ],
    },
    privacyPolicy: {
      type: [
        {
          title: String,
          description: String,
        },
      ],
    },
    cancellationPolicy: {
      type: [
        {
          title: String,
          description: String,
        },
      ],
    },
    faqs: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
    },
    footer: {
      type: [
        {
          title: {
            type: String,
          },
          links: {
            type: [
              {
                title: String,
                link: String,
              },
            ],
          },
        },
      ],
    },
    promotionBanner: {
      type: [
        {
          title: String,
          link: String,
          show: Boolean,
        },
      ],
    },
    copyrightFooter: {
      title: String,
      description: String,
    },
    defaultAffiliatePercent: {
      type: Number,
      default: 0,
    },
    socialMedia: {
      type: [
        {
          title: String,
          link: String,
          iconLink: String,
        },
      ],
    },
    CMSName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

type CMSCollectionType = InferSchemaType<typeof CMSSchema>;

CMSSchema.plugin(paginate);

const CMSCollection = model<
  CMSCollectionType,
  PaginateModel<CMSCollectionType>
>("CMSs", CMSSchema);

export { CMSCollection, CMSCollectionType };
