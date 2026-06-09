import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "氏名を入力してください。").max(100),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください。")
    .max(72, "パスワードが長すぎます。"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません。",
  path: ["passwordConfirm"],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください。"),
});

const homeworkItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(500),
  completed: z.boolean(),
});

const meetingTitleSchema = z
  .string()
  .max(200, "タイトルは200文字以内で入力してください。")
  .optional()
  .or(z.literal(""));

export const meetingCreateSchema = z.object({
  date: z
    .string()
    .min(1, "MTG実施日を選択してください。")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません。"),
  title: meetingTitleSchema,
  content: z
    .string()
    .min(1, "会話内容を入力してください。")
    .max(50000, "会話内容は50000文字以内で入力してください。"),
  homework: z.array(homeworkItemSchema).max(50).optional(),
});

export const meetingCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメントを入力してください。")
    .max(10000, "コメントは10000文字以内で入力してください。"),
});

export const meetingHomeworkSchema = z.object({
  homework: z.array(homeworkItemSchema).max(50),
});

export const meetingUpdateSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません。")
      .optional(),
    title: meetingTitleSchema,
    content: z
      .string()
      .min(1, "会話内容を入力してください。")
      .max(50000, "会話内容は50000文字以内で入力してください。")
      .optional(),
    homework: z.array(homeworkItemSchema).max(50).optional(),
  })
  .refine(
    (data) =>
      data.date ||
      data.title !== undefined ||
      data.content ||
      data.homework !== undefined,
    {
      message: "更新する項目がありません。",
    },
  );

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください。"),
  password: z
    .string()
    .min(8, "新しいパスワードは8文字以上で入力してください。")
    .max(72, "パスワードが長すぎます。"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "新しいパスワードが一致しません。",
  path: ["passwordConfirm"],
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});

const ticketField = z.string().min(1).max(5000);
const ticketTitleField = z
  .string()
  .min(1, "タイトルを入力してください。")
  .max(200, "タイトルは200文字以内で入力してください。");

export const ticketCreateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SYSTEM"),
    title: ticketTitleField,
    systemField1: ticketField,
    systemField2: ticketField,
    systemField3: z.string().max(5000).optional().or(z.literal("")),
  }),
  z.object({
    type: z.literal("USAGE"),
    title: ticketTitleField,
    usageField1: ticketField,
    usageField2: ticketField,
  }),
]);

export const ticketCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメントを入力してください。")
    .max(10000, "コメントは10000文字以内で入力してください。"),
});

export const ticketStatusSchema = z.object({
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CANCELLED"]),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "トークンが無効です。"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください。")
    .max(72),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません。",
  path: ["passwordConfirm"],
});
